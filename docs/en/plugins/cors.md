# CORS

Production-ready CORS (Cross-Origin Resource Sharing) middleware for YasuiJS applications. Handles preflight requests, origin validation, credentials, and modern security features.

## Installation

::: code-group
```bash [npm]
npm install @yasui/cors
```

```bash [pnpm]
pnpm add @yasui/cors
```

```bash [bun]
bun add @yasui/cors
```

```bash [deno]
deno add jsr:@yasui/cors
```
:::

## Overview

The `@yasui/cors` package provides a standards-compliant CORS middleware with advanced features including:

- **Origin validation** - Exact match, wildcard, or regex patterns
- **Preflight handling** - Automatic OPTIONS request processing
- **Credentials support** - Cookie and authorization header handling
- **Cache optimization** - Proper `Vary` header management
- **Private Network Access** - Support for CORS-RFC1918 specification
- **Security-first** - Industry-standard defaults and validation

**Important:** This is a functional middleware (not class-based). It works alongside YasuiJS class middlewares and should be registered in the global `middlewares` array.

## Quick Start

### Basic Usage

```typescript
import yasui from 'yasui';
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: ['https://app.example.com', 'https://admin.example.com']
    })
  ],
  controllers: [UserController]
});
```

### Wildcard (Development Only)

```typescript
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: '*'  // ⚠️ Not recommended for production
    })
  ],
  controllers: [UserController]
});
```

**Warning:** Using `origins: '*'` is not recommended in production. Always specify exact origins or use regex patterns for better security.

## Configuration

The `cors()` function accepts a configuration object with the following options:

### `origins` (required)

Allowed origins for cross-origin requests. Can be a wildcard, an array of exact origins, or an array including regex patterns.

- **Type:** `string[] | RegExp[] | (string | RegExp)[] | '*'`
- **Required:** Yes
- **Examples:**

```typescript
// Exact origins
cors({
  origins: ['https://app.example.com', 'https://admin.example.com']
})

// Wildcard (development only)
cors({
  origins: '*'
})

// Regex patterns for dynamic subdomains
cors({
  origins: [
    'https://app.example.com',
    /^https:\/\/.*\.example\.com$/  // Matches any subdomain
  ]
})
```

### `methods`

HTTP methods allowed in cross-origin requests.

- **Type:** `string`
- **Default:** `'GET,POST,PUT,DELETE,PATCH,OPTIONS'`
- **Example:**

```typescript
cors({
  origins: ['https://app.example.com'],
  methods: 'GET,POST,DELETE'
})
```

### `headers`

Request headers allowed in cross-origin requests.

- **Type:** `string`
- **Default:** `'Content-Type,Authorization'`
- **Example:**

```typescript
cors({
  origins: ['https://app.example.com'],
  headers: 'Content-Type,Authorization,X-API-Key'
})
```

### `credentials`

Allow credentials (cookies, authorization headers) in cross-origin requests.

- **Type:** `boolean`
- **Default:** `false`
- **Important:** Cannot be used with `origins: '*'` (will throw error at startup)

```typescript
cors({
  origins: ['https://app.example.com'],  // Must specify exact origins
  credentials: true
})
```

**Security Note:** When `credentials: true`, browsers require an exact origin in `Access-Control-Allow-Origin` header. The middleware enforces this at startup and will throw an error if you try to use wildcards with credentials.

### `maxAge`

Preflight response cache duration in seconds. Determines how long browsers cache the preflight response.

- **Type:** `number`
- **Default:** `86400` (24 hours)
- **Example:**

```typescript
cors({
  origins: ['https://app.example.com'],
  maxAge: 3600  // 1 hour
})
```

### `exposeHeaders`

Response headers exposed to the client (accessible via JavaScript).

- **Type:** `string`
- **Default:** `undefined`
- **Example:**

```typescript
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: 'X-Total-Count,X-Page-Number'
})
```

**Usage:** By default, browsers only expose safe headers (like `Content-Type`). Use this option to expose custom headers to client-side JavaScript.

### `allowNullOrigin`

Allow requests with `null` origin (file://, sandboxed iframes, privacy-preserving contexts).

- **Type:** `boolean`
- **Default:** `false`
- **Example:**

```typescript
cors({
  origins: ['https://app.example.com'],
  allowNullOrigin: true  // Allow file:// and sandboxed contexts
})
```

**Use Cases:**
- Testing from local HTML files (`file://` protocol)
- Sandboxed iframes (`<iframe sandbox>`)
- Privacy-preserving browser features

### `allowPrivateNetwork`

Enable Private Network Access support (CORS-RFC1918) for requests from public networks to private/local networks.

- **Type:** `boolean`
- **Default:** `false`
- **Example:**

```typescript
cors({
  origins: ['https://app.example.com'],
  allowPrivateNetwork: true
})
```

**Use Case:** Allows web applications to access local network resources (e.g., `http://192.168.1.100`) when the browser requests it via the `Access-Control-Request-Private-Network` preflight header.

**Security Note:** The middleware only sends `Access-Control-Allow-Private-Network: true` if the preflight request explicitly includes `Access-Control-Request-Private-Network: true`, following the CORS-RFC1918 specification.

## How It Works

### Preflight Requests

When a browser makes a cross-origin request with custom headers or methods, it sends a preflight `OPTIONS` request first:

```http
OPTIONS /api/users HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type,authorization
```

The CORS middleware intercepts this and responds:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization
Access-Control-Max-Age: 86400
Vary: Origin
```

### Actual Requests

For actual requests, the middleware adds CORS headers to the response:

```http
HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Credentials: true
Vary: Origin
Content-Type: application/json

{"data": [...]}
```

### Origin Rejection

When an origin is not allowed, the middleware:
1. **Preflight (OPTIONS):** Returns `204 No Content` without CORS headers (industry standard)
2. **Actual requests:** Passes through without adding CORS headers

The browser then blocks the response, preventing JavaScript access.

**Why 204 instead of 403?** Returning 204 without CORS headers is the industry standard (used by Express, Fastify, etc.) because it avoids leaking information about whether an endpoint exists.

### Cache Management

The middleware automatically manages the `Vary: Origin` header:

- **When `origins: '*'` without credentials:** No `Vary` header (response is identical for all origins)
- **When using origin list or credentials:** Adds `Vary: Origin` header
- **When existing `Vary` header present:** Merges `Origin` with existing values (e.g., `Vary: Accept-Encoding, Origin`)

This ensures CDNs and browsers cache CORS responses correctly.

## Security Best Practices

### 1. Never Use Wildcards with Credentials

```typescript
// ❌ BAD - Will throw error at startup
cors({
  origins: '*',
  credentials: true  // Error: cannot use credentials with wildcard
})

// ✅ GOOD
cors({
  origins: ['https://app.example.com'],
  credentials: true
})
```

### 2. Validate Origins Strictly

```typescript
// ❌ RISKY - Too permissive
cors({
  origins: '*'
})

// ✅ BETTER - Explicit origins
cors({
  origins: ['https://app.example.com']
})

// ✅ GOOD - Regex for controlled wildcards
cors({
  origins: [/^https:\/\/[a-z0-9-]+\.example\.com$/]
})
```

### 3. Minimize Exposed Headers

```typescript
// ❌ RISKY - Exposes all headers
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: '*'  // Not recommended
})

// ✅ GOOD - Only expose necessary headers
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: 'X-Total-Count,X-Page-Number'
})
```

### 4. Use Environment-Based Configuration

```typescript
// ✅ GOOD - Different configs for dev/prod
const corsConfig = {
  origins: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000'],
  credentials: true
};

yasui.createServer({
  middlewares: [cors(corsConfig)],
  controllers: [UserController]
});
```

## Technical Details

**Important:** The CORS middleware must be registered in the global `middlewares` array to intercept OPTIONS requests:

```typescript
yasui.createServer({
  middlewares: [cors({ origins: [...] })],  // ✅ Registered globally
  controllers: [UserController]
});
```

If you get a 404 on preflight requests, verify the middleware is registered at the application level, not at controller or route level.

### Startup Validation

The middleware validates configuration at application startup (not per-request):
- ❌ Throws error if `credentials: true` with `origins: '*'`

### Header Merging

When injecting CORS headers into responses:
- Preserves existing response headers
- Merges `Vary` header intelligently (doesn't overwrite `Vary: Accept-Encoding`)
- Uses `Headers.set()` for CORS headers (case-insensitive)

### Performance Optimizations

- Origin validation uses `Array.some()` (stops at first match)
- Regex patterns compiled once at middleware creation
- No body parsing for OPTIONS requests (immediate response)

### Compliance

- **CORS Specification:** Full compliance with W3C CORS spec
- **RFC1918:** Private Network Access support
- **Industry Standards:** Follows Express/Fastify patterns (204 for rejected preflight)

## See Also

- [Middlewares Reference](/reference/middlewares) - Learn about YasuiJS middleware system
- [Configuration](/reference/config) - Application-level configuration
- [Error Handling](/reference/error-handling) - Handle CORS errors properly
