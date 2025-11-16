/* eslint-disable @typescript-eslint/no-explicit-any */

import { MaybePromise, JsonValue } from './interfaces/utils.i.js';


/**
 * YasuiJS Request class extending Web Standard Request
 * Adds yasui-specific properties while maintaining Web Standards compatibility
 */
export class YasuiRequest extends Request {
  /** Route parameters extracted from URL path (e.g., /users/:id) */
  params: Record<string, string> = {};

  /** @deprecated Use `@Logger()` to access Request logger */
  logger?: never;

  /** Source controller or middleware name for debugging */
  source?: string;

  /** Cached parsed body to avoid re-parsing */
  private _parsedBody?: any;

  /** Cached headers as plain object for Express-style access */
  private _headersObj?: Record<string, string>;

  /** Cached parsed query string */
  private _query?: Record<string, string>;

  /** Cached parsed cookies */
  private _cookies?: Record<string, string>;

  /** Cached parsed URL object to avoid re-parsing */
  private _parsedUrl?: URL;

  constructor(input: globalThis.RequestInfo | URL, init?: globalThis.RequestInit) {
    super(input, init);
  }

  /**
   * Get parsed body (Express-compatible property)
   * Returns cached parsed body from json() call
   * Note: This shadows the Web Standard Request.body (ReadableStream)
   */
  override get body(): any {
    return this._parsedBody;
  }

  /**
   * Get headers as a plain object for Express-style property access
   * Allows req.headers.something or req.headers['content-type']
   * Note: This intentionally overrides the standard Headers type for Express compatibility
   */
  override get headers(): any {
    if (!this._headersObj) {
      this._headersObj = Object.fromEntries(super.headers.entries());
    }
    return this._headersObj;
  }

  /**
   * Get native Headers object for performance-critical operations
   * Use this when you only need to check one or two headers via .get()
   * to avoid converting all headers to a plain object
   */
  get rawHeaders(): Headers {
    return super.headers;
  }

  /** Get the pathname of the URL - without query string (Express-compatible property) */
  get path(): string {
    return this.parsedUrl.pathname;
  }

  /** Get hostname from the Host header (Express-compatible property) */
  get hostname(): string {
    const host = this.headers.host || '';
    // Remove port if present
    return host.split(':')[0];
  }

  /** Get protocol http or https (Express-compatible property) */
  get protocol(): string {
    // Check X-Forwarded-Proto header (common with proxies/load balancers)
    const forwarded = this.headers['x-forwarded-proto'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    // Parse from URL
    return this.parsedUrl.protocol.replace(':', '');
  }

  /**
   * Get client IP address (Express-compatible property)
   * Checks X-Forwarded-For, X-Real-IP headers, or returns undefined
   */
  get ip(): string | undefined {
    // Check X-Forwarded-For (leftmost = client)
    const forwarded = this.headers['x-forwarded-for'];
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    // Check X-Real-IP
    const realIp = this.headers['x-real-ip'];
    if (realIp) {
      return realIp;
    }
    // Cannot access socket in SRVX/Web Standards
    return undefined;
  }

  /** Get parsed query string as object (Express-compatible property) */
  get query(): Record<string, string> {
    if (!this._query) {
      this._query = Object.fromEntries(this.parsedUrl.searchParams);
    }
    return this._query;
  }

  /** Get parsed cookies as object (Express-compatible property) */
  get cookies(): Record<string, string> {
    if (!this._cookies) {
      this._cookies = {};
      const cookieHeader = this.headers.cookie;
      if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie: string) => {
          const [key, ...valueParts] = cookie.split('=');
          if (key) {
            this._cookies![key.trim()] = valueParts.join('=').trim();
          }
        });
      }
    }
    return this._cookies;
  }

  /** Get parsed URL object (cached) */
  private get parsedUrl(): URL {
    if (!this._parsedUrl) {
      this._parsedUrl = new URL(this.url);
    }
    return this._parsedUrl;
  }

  /**
   * Parse and cache the request body as JSON
   * Returns cached value on subsequent calls
   */
  override async json(): Promise<any> {
    if (this._parsedBody !== undefined) {
      return this._parsedBody;
    }
    this._parsedBody = await super.json();
    return this._parsedBody;
  }
}


/** Type alias for yasui Request */
export type Request = YasuiRequest;

/** Next function for middleware chain */
export type NextFunction = () => Promise<Response> | Response;

/** Handler function signature (supports optional next for middleware) */
export type RequestHandler = (
  req: YasuiRequest,
  next?: NextFunction
) => MaybePromise<Response | JsonValue | void>;

/** Fetch handler type for yasui apps */
export type FetchHandler = {
  fetch: (req: globalThis.Request) => MaybePromise<Response>;
};
