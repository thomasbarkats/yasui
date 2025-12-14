import type { YasuiRequest, RequestHandler, NextFunction } from 'yasui';
import { HttpError } from 'yasui';


/** Rate limit storage interface for custom implementations */
export interface RateLimitStore {
  /** Increment request count and return current value */
  increment: (key: string) => Promise<number> | number;
  /** Reset counter for a specific key */
  reset: (key: string) => Promise<void> | void;
}

/** Rate limit configuration */
export interface RateLimitConfig {
  /** Maximum requests allowed per window
   *  @default 100 */
  max?: number;
  /** Time window in milliseconds
   *  @default 60000 (1 minute) */
  windowMs?: number;
  /** Custom key generator function. Returns identifier for rate limiting
   *  @default Uses client IP address
   *  @example (req) => req.headers.get('x-api-key') ?? 'anonymous' */
  keyGenerator?: (req: YasuiRequest) => string;
  /** Custom storage implementation
   *  @default In-memory store */
  store?: RateLimitStore;
  /** Custom rate limit exceeded handler. Can throw HttpError, return data (auto-converts to JSON), or return Response
   *  @default Throws HttpError(429, message) */
  // eslint-disable-next-line max-len
  handler?: (req: YasuiRequest, limit: number, remaining: number, resetTime: number) => Response | unknown | Promise<Response | unknown>;
  /** Skip rate limiting based on request
   *  @example (req) => req.headers.get('x-internal-request') === 'true' */
  skip?: (req: YasuiRequest) => boolean | Promise<boolean>;
  /** Include rate limit info in response headers
   *  @default true */
  standardHeaders?: boolean;
}


/** In-memory rate limit store */
class MemoryStore implements RateLimitStore {
  private hits = new Map<string, number[]>();
  private lastCleanup = Date.now();
  private readonly maxKeys = 10000;
  private readonly cleanupIntervalMs = 60000;

  constructor(private windowMs: number) {}

  increment(key: string): number {
    const now = Date.now();
    const timestamps = this.hits.get(key) || [];

    /** remove expired timestamps */
    const validTimestamps = timestamps.filter(ts => now - ts < this.windowMs);
    validTimestamps.push(now);

    this.hits.set(key, validTimestamps);

    /** cleanup: time-based OR size-based */
    if (now - this.lastCleanup > this.cleanupIntervalMs || this.hits.size > this.maxKeys) {
      this.cleanup(now);
      this.lastCleanup = now;
    }

    return validTimestamps.length;
  }

  reset(key: string): void {
    this.hits.delete(key);
  }

  private cleanup(now: number): void {
    const keysToDelete: string[] = [];

    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter(ts => now - ts < this.windowMs);
      if (valid.length === 0) {
        keysToDelete.push(key);
      } else {
        this.hits.set(key, valid);
      }
    }

    for (const key of keysToDelete) {
      this.hits.delete(key);
    }

    /** if still over limit after cleanup, remove oldest entries (LRU) */
    if (this.hits.size > this.maxKeys) {
      const entries = Array.from(this.hits.entries());
      const toRemove = entries
        .sort((a, b) => Math.min(...a[1]) - Math.min(...b[1]))
        .slice(0, Math.ceil(this.maxKeys * 0.2));

      for (const [key] of toRemove) {
        this.hits.delete(key);
      }
    }
  }
}


/** Extract client IP from request */
function getClientIp(req: YasuiRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  /** fallback: use request signature to prevent all unknowns sharing same limit */
  const userAgent = req.headers.get('user-agent') || '';
  const acceptLang = req.headers.get('accept-language') || '';
  return `unknown:${hashString(userAgent + acceptLang)}`;
}

/** Simple hash function for fallback key generation */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/** Convert handler result to Response (matches YasuiJS behavior) */
function convertToResponse(result: Response | unknown, status: number = 200): Response {
  if (result instanceof globalThis.Response) {
    return result;
  }
  if (result === undefined || result === null) {
    return new Response(null, { status: 204 });
  }
  return Response.json(result, { status });
}


/** Rate limit middleware factory for YasuiJS */
export function rateLimit(config: RateLimitConfig = {}): RequestHandler {
  const {
    max = 100,
    windowMs = 60000,
    keyGenerator = getClientIp,
    store = new MemoryStore(windowMs),
    handler,
    skip,
    standardHeaders = true
  } = config;

  return async (req: YasuiRequest, next?: NextFunction): Promise<Response> => {
    /** check if rate limiting should be skipped */
    if (skip && await skip(req)) {
      return next ? next() : new Response(null, { status: 500 });
    }

    const key = keyGenerator(req);
    const hits = await store.increment(key);
    const remaining = Math.max(0, max - hits);
    const resetTime = Date.now() + windowMs;

    /** rate limit exceeded */
    if (hits > max) {
      const retryAfter = Math.ceil(windowMs / 1000);

      if (handler) {
        try {
          const result = await handler(req, max, remaining, resetTime);
          let response = convertToResponse(result, 429);

          /** inject rate limit headers if enabled */
          if (standardHeaders && response.status === 429) {
            const headers = new Headers(response.headers);
            headers.set('RateLimit-Limit', max.toString());
            headers.set('RateLimit-Remaining', '0');
            headers.set('RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
            headers.set('Retry-After', retryAfter.toString());

            response = new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers
            });
          }

          return response;
        } catch (err) {
          /** if handler throws HttpError, convert to Response with rate limit headers */
          if (err instanceof HttpError) {
            const headers = new Headers({
              'Content-Type': 'application/json'
            });

            if (standardHeaders) {
              headers.set('RateLimit-Limit', max.toString());
              headers.set('RateLimit-Remaining', '0');
              headers.set('RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
              headers.set('Retry-After', retryAfter.toString());
            }

            return new Response(
              JSON.stringify({
                error: 'Too Many Requests',
                message: err.message
              }),
              { status: err.status || 429, headers }
            );
          }
          throw err;
        }
      }

      /** default behavior: return 429 with headers */
      const headers = new Headers({
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString()
      });

      if (standardHeaders) {
        headers.set('RateLimit-Limit', max.toString());
        headers.set('RateLimit-Remaining', '0');
        headers.set('RateLimit-Reset', Math.ceil(resetTime / 1000).toString());
      }

      return new Response(
        JSON.stringify({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`
        }),
        { status: 429, headers }
      );
    }

    /** execute next middleware/handler */
    if (!next) {
      return new Response(null, { status: 500 });
    }

    const response = await next();

    /** inject rate limit headers into response */
    if (standardHeaders) {
      const responseHeaders = new Headers(response.headers);
      responseHeaders.set('RateLimit-Limit', max.toString());
      responseHeaders.set('RateLimit-Remaining', remaining.toString());
      responseHeaders.set('RateLimit-Reset', Math.ceil(resetTime / 1000).toString());

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders
      });
    }

    return response;
  };
}
