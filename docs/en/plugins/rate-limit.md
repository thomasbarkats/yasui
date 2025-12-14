# Rate Limiting

Production-ready rate limiting middleware for YasuiJS applications. Protects your API from abuse by limiting the number of requests per time window, with support for custom storage backends and flexible key generation.

## Installation

::: code-group
```bash [npm]
npm install @yasui/rate-limit
```

```bash [pnpm]
pnpm add @yasui/rate-limit
```

```bash [bun]
bun add @yasui/rate-limit
```

```bash [deno]
deno add jsr:@yasui/rate-limit
```
:::

## Overview

The `@yasui/rate-limit` package provides a flexible rate limiting middleware with advanced features including:

- **Configurable limits** - Set max requests per time window
- **In-memory store** - Built-in storage with automatic cleanup
- **Extensible storage** - Redis, database, or custom store support
- **Custom key generation** - Rate limit by IP, API key, user ID, or custom logic
- **Standard headers** - RFC 6585 compliant rate limit headers
- **Skip logic** - Whitelist specific requests
- **Custom handlers** - Override default 429 responses

**Important:** This is a functional middleware (not class-based). It works alongside YasuiJS class middlewares and should be registered in the global `middlewares` array.

## Quick Start

### Basic Usage

```typescript
import yasui from 'yasui';
import { rateLimit } from '@yasui/rate-limit';

yasui.createServer({
  middlewares: [
    rateLimit({
      max: 100,       // 100 requests
      windowMs: 60000 // per minute
    })
  ],
  controllers: [UserController]
});
```

## Configuration

The `rateLimit()` function accepts a configuration object with the following options:

### `max`

Maximum number of requests allowed per time window.

- **Type:** `number`
- **Default:** `100`
- **Example:**

```typescript
rateLimit({
  max: 1000  // Allow 1000 requests per window
})
```

### `windowMs`

Time window duration in milliseconds.

- **Type:** `number`
- **Default:** `60000` (1 minute)
- **Examples:**

```typescript
// 1 minute
rateLimit({ max: 100, windowMs: 60000 })

// 15 minutes
rateLimit({ max: 500, windowMs: 15 * 60 * 1000 })

// 1 hour
rateLimit({ max: 5000, windowMs: 60 * 60 * 1000 })
```

### `keyGenerator`

Custom function to generate rate limit keys. By default, uses client IP address.

- **Type:** `(req: YasuiRequest) => string`
- **Default:** Uses `X-Forwarded-For`, `X-Real-IP`, or `'unknown'`
- **Examples:**

```typescript
// Rate limit by API key
rateLimit({
  max: 1000,
  windowMs: 3600000,
  keyGenerator: (req) => {
    return req.headers.get('x-api-key') ?? 'anonymous';
  }
})

// Rate limit by user ID (from custom auth middleware)
rateLimit({
  max: 500,
  windowMs: 60000,
  keyGenerator: (req) => {
    return req.userId ?? 'anonymous';  // Assuming auth middleware sets req.userId
  }
})

// Combine multiple factors
rateLimit({
  max: 100,
  windowMs: 60000,
  keyGenerator: (req) => {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
    const endpoint = new URL(req.url).pathname;
    return `${ip}:${endpoint}`;
  }
})
```

### `store`

Custom storage backend for rate limit data. By default, uses in-memory store.

- **Type:** `RateLimitStore`
- **Default:** `MemoryStore`
- **Interface:**

```typescript
interface RateLimitStore {
  increment: (key: string) => Promise<number> | number;
  reset: (key: string) => Promise<void> | void;
}
```

**Example (Redis):**

```typescript
import { createClient } from 'redis';
import type { RateLimitStore } from '@yasui/rate-limit';

class RedisStore implements RateLimitStore {
  constructor(
    private client: ReturnType<typeof createClient>,
    private windowMs: number
  ) {}

  async increment(key: string): Promise<number> {
    const redisKey = `ratelimit:${key}`;
    const count = await this.client.incr(redisKey);

    if (count === 1) {
      await this.client.expire(redisKey, Math.ceil(this.windowMs / 1000));
    }

    return count;
  }

  async reset(key: string): Promise<void> {
    await this.client.del(`ratelimit:${key}`);
  }
}

const redisClient = createClient();
await redisClient.connect();

yasui.createServer({
  middlewares: [
    rateLimit({
      max: 100,
      windowMs: 60000,
      store: new RedisStore(redisClient, 60000)
    })
  ],
  controllers: [UserController]
});
```

### `handler`

Custom handler for rate limit exceeded responses. Follows YasuiJS patterns: throw `HttpError`, return data (auto-converts to JSON), or return `Response` for custom formats.

- **Type:** `(req: YasuiRequest, limit: number, remaining: number, resetTime: number) => Response | unknown | Promise<Response | unknown>`
- **Default:** Returns JSON 429 response with standard headers
- **Examples:**

```typescript
import { HttpError } from 'yasui';

// Throw HttpError (recommended for JSON errors)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req, limit) => {
    throw new HttpError(429, 'Too many requests. Please slow down.');
  }
})

// Return object (auto-converts to JSON with 429 status)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req, limit, remaining, resetTime) => {
    return {
      error: 'Rate limit exceeded',
      limit,
      remaining,
      resetTime: Math.ceil(resetTime / 1000)
    };
  }
})

// Return Response for custom format (HTML, XML, etc.)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req) => {
    const acceptsHtml = req.headers.get('accept')?.includes('text/html');

    if (acceptsHtml) {
      return new Response(
        '<h1>Too Many Requests</h1><p>Please try again later.</p>',
        {
          status: 429,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    throw new HttpError(429, 'Rate limit exceeded');
  }
})
```

### `skip`

Function to skip rate limiting for specific requests.

- **Type:** `(req: YasuiRequest) => boolean | Promise<boolean>`
- **Default:** `undefined`
- **Examples:**

```typescript
// Skip internal requests
rateLimit({
  max: 100,
  windowMs: 60000,
  skip: (req) => {
    return req.headers.get('x-internal-request') === 'true';
  }
})

// Skip authenticated admin users
rateLimit({
  max: 100,
  windowMs: 60000,
  skip: async (req) => {
    const token = req.headers.get('authorization');
    const user = await validateToken(token);
    return user?.role === 'admin';
  }
})

// Skip health check endpoints
rateLimit({
  max: 100,
  windowMs: 60000,
  skip: (req) => {
    const path = new URL(req.url).pathname;
    return path === '/health' || path === '/ping';
  }
})
```

### `standardHeaders`

Include standard rate limit headers in responses.

- **Type:** `boolean`
- **Default:** `true`
- **Headers added:**
  - `RateLimit-Limit`: Maximum requests per window
  - `RateLimit-Remaining`: Requests remaining
  - `RateLimit-Reset`: Unix timestamp when limit resets
  - `Retry-After`: Seconds until reset (only on 429 responses)

```typescript
// Disable standard headers
rateLimit({
  max: 100,
  windowMs: 60000,
  standardHeaders: false
})
```

## How It Works

### Request Tracking

The middleware tracks requests using a sliding window algorithm:

1. **Extract key:** Uses `keyGenerator` to identify the requester (IP, API key, etc.)
2. **Increment counter:** Stores request timestamp in the configured store
3. **Check limit:** Compares request count against `max`
4. **Allow or deny:** Returns 429 if exceeded, otherwise continues

### Response Headers

When `standardHeaders: true`, responses include:

```http
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1699564800
Content-Type: application/json
```

When rate limit exceeded:

```http
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1699564800
Retry-After: 45
Content-Type: application/json

{"error":"Too Many Requests","message":"Rate limit exceeded. Try again in 45 seconds."}
```

### Memory Store Cleanup

The built-in `MemoryStore` automatically cleans up expired entries:

- Removes timestamps older than `windowMs` on each request
- Performs full cleanup when store size exceeds 10,000 entries
- Uses efficient filtering to minimize memory usage

### Key Generation

Default key generation follows this priority:

1. `X-Forwarded-For` header (first IP in chain)
2. `X-Real-IP` header
3. `'unknown'` fallback

**Production Tip:** Behind a reverse proxy (nginx, Cloudflare), ensure `X-Forwarded-For` is set correctly. Consider validating the header to prevent spoofing.

## Security Best Practices

### 1. Use Conservative Limits

```typescript
// ❌ TOO GENEROUS
rateLimit({ max: 100000, windowMs: 60000 })

// ✅ REASONABLE
rateLimit({ max: 100, windowMs: 60000 })
```

### 2. Protect Sensitive Endpoints

```typescript
// ✅ GOOD - Strict limits for auth endpoints
const authLimit = rateLimit({ max: 5, windowMs: 15 * 60 * 1000 });

@Controller('/auth')
export class AuthController {
  @Post('/login', authLimit)
  login() {}

  @Post('/reset-password', authLimit)
  resetPassword() {}
}
```

### 3. Validate Key Generator Input

**Default behavior:** Uses `X-Forwarded-For` → `X-Real-IP` → request signature hash. Behind a reverse proxy, ensure headers are set correctly.

```typescript
// ✅ PRODUCTION - Validate trusted proxy
rateLimit({
  keyGenerator: (req) => {
    const forwarded = req.headers.get('x-forwarded-for');

    // Only trust X-Forwarded-For from known proxies
    if (forwarded && isTrustedProxy(req)) {
      return forwarded.split(',')[0].trim();
    }

    // Fallback: don't share rate limit across unknowns
    const userAgent = req.headers.get('user-agent') || '';
    return `fallback:${hashUserAgent(userAgent)}`;
  }
})
```

**Note:** Default key generator uses request signature (User-Agent + Accept-Language) as fallback to prevent all unknown requests sharing the same rate limit.

### 4. Use Persistent Storage in Production

```typescript
// ❌ RISKY - In-memory store (lost on restart)
rateLimit({ max: 100, windowMs: 60000 })

// ✅ PRODUCTION - Redis store (persistent)
rateLimit({
  max: 100,
  windowMs: 60000,
  store: new RedisStore(redisClient, 60000)
})
```

### 5. Monitor Rate Limit Violations

```typescript
import { HttpError } from 'yasui';

rateLimit({
  max: 100,
  windowMs: 60000,
  handler: async (req, limit) => {
    // Log violation for monitoring
    console.warn(`Rate limit exceeded: ${req.url}`);
    await logSecurityEvent({
      type: 'rate_limit_exceeded',
      ip: req.headers.get('x-forwarded-for'),
      endpoint: req.url
    });

    throw new HttpError(429, 'Too Many Requests');
  }
})
```

## Technical Details

The rate limit middleware can be applied at all levels (application, controller, endpoint). See [Middlewares Reference](/reference/middlewares) for details on middleware usage levels and execution order.

### Store Interface

Custom stores must implement:

```typescript
interface RateLimitStore {
  increment: (key: string) => Promise<number> | number;
  reset: (key: string) => Promise<void> | void;
}
```

- `increment`: Increment counter and return current count
- `reset`: Clear counter for specific key

### Performance Optimizations

- Timestamps filtered efficiently (only valid entries kept)
- Dual cleanup strategy: time-based (every 60s) + size-based (>10k keys)
- LRU eviction when max size exceeded (removes 20% oldest entries)
- Synchronous increment for in-memory store (no await overhead)
- Headers injected without cloning response body

**Memory Safety:** In-memory store limited to 10,000 keys max with automatic LRU eviction. For high-traffic production (>10k unique IPs/hour), use Redis store.

### Compliance

- **RFC 6585:** 429 Too Many Requests status code
- **Draft RFC:** RateLimit-* headers (IETF draft standard)
- **Industry Standards:** Retry-After header for client retry logic

## See Also

- [Middlewares Reference](/reference/middlewares) - Learn about YasuiJS middleware system
- [CORS Plugin](/plugins/cors) - Cross-origin resource sharing
- [Error Handling](/reference/error-handling) - Handle rate limit errors properly
