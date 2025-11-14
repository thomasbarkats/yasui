# Configuration

Complete configuration reference for YasuiJS applications using `yasui.createServer()` and `yasui.createApp()`.

## Overview

YasuiJS provides two main ways to create your application:

- **`yasui.createServer(config)`** - Creates and starts a server automatically
- **`yasui.createApp(config)`** - Returns a fetch handler for manual server configuration

Both methods accept the same configuration object with the following options.

## Configuration Options

### Required Options

#### `controllers`
**Type:** `Array<Constructor>`  
**Description:** Array of controller classes to register in your application.

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController, ProductController]
});
```

### Optional Options

#### `middlewares`
Array of global middlewares to apply to all requests. Must be YasuiJS middleware classes decorated with `@Middleware()`.
- **Type:** `Array<Constructor>`
- **Default:** `[]`
- **Example value:** `[LoggingMiddleware, AuthMiddleware]`
- **Note:** Express middleware (like `cors()`, `helmet()`) is not compatible with YasuiJS 4.x

#### `globalPipes`
Array of global pipes to apply to all route parameters. See [Pipes](/reference/pipes) for details.  
- **Type:** `Array<Constructor<IPipeTransform>>`
- **Default:** `[]`
- **Example value:** `[ValidationPipe, TrimPipe]`

#### `environment`
Environment name for your application.
- **Type:** `string`
- **Default:** `process.env.NODE_ENV || 'development'`
- **Example value:** `production`

#### `port`
Port number for the server. Only used with `createServer()`.
- **Type:** `number | string`
- **Default:** `3000`

#### `hostname`
Hostname to bind the server to.
- **Type:** `string | undefined`
- **Default:** `'localhost'` in development, undefined in production

#### `tls`
TLS/HTTPS configuration. When provided, server automatically uses HTTPS.
- **Type:** `TLSConfig | undefined`
- **Default:** `undefined` (HTTP)
- **Example value:**
```typescript
{
  cert: './path/to/cert.pem',  // or PEM string
  key: './path/to/key.pem',    // or PEM string
  passphrase: 'optional',      // optional key passphrase
  ca: './path/to/ca.pem'       // optional CA certificates
}
```

#### `runtimeOptions`
Runtime-specific configuration options.
- **Type:** `RuntimeOptions | undefined`
- **Default:** `undefined`
- **Example value:**
```typescript
{
  node: {
    http2: true,              // Enable HTTP/2 (default: true with TLS)
    maxHeaderSize: 16384,     // Customize header size
    ipv6Only: false           // IPv6-only mode
  }
}
```

#### `debug`
Enable debug mode with additional logging and request tracing.
- **Type:** `boolean`
- **Default:** `false`

#### `injections`
Custom injection tokens for dependency injection. See [Dependency Injection](/reference/dependency-injection) for details.
- **Type:** `Array<Injection>`
- **Default:** `[]`

Where `Injection` is:
```typescript
{ token: string; provide: any } | // Direct value
{ token: string; factory: () => Promise<any>; deferred?: boolean } // Factory
```

- **Example values:**
```typescript
[
  // Direct value
  { token: 'CONFIG', provide: 'value' },

  // Async factory (built before the server starts)
  {
    token: 'DATABASE',
    factory: async () => {
      const db = new Database();
      await db.connect();
      return db;
    }
  },
  // Non-blocking factory (server starts without it and accepts errors)
  {
    token: 'ANALYTICS',
    deferred: true,
    factory: async () => {
      const analytics = new AnalyticsClient();
      await analytics.connect();
      return analytics;
    },
  }
]
```

#### `swagger`
Swagger documentation configuration. See [Swagger](/reference/swagger) for details.
- **Type:** `SwaggerConfig | undefined`
- **Default:** `undefined`
- **Example value:**
```typescript
{
  enabled: true,
  path: '/api-docs',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation'
  }
}
```

#### `enableDecoratorValidation`
Enable validation of decorators at startup to catch configuration errors.
- **Type:** `boolean`
- **Default:** `true`

## createServer() vs createApp()

### createServer()

Creates a server and starts listening automatically:

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController],
  port: 3000,
  debug: true
});
```

**Use when:**
- You want to start your server immediately
- You're building a standard API
- You don't need custom server configuration

### createApp()

Returns a fetch handler compatible with any Web Standards-based server or platform:

```typescript
import yasui from 'yasui';

const app = yasui.createApp({
  controllers: [UserController]
});

// app.fetch is a standard fetch handler - use with ANY compatible server

// Option 1: SRVX (multi-runtime)
import { serve } from 'srvx';
serve({
  fetch: app.fetch,
  port: 3000
});

// Option 2: Native Deno
Deno.serve({ port: 3000 }, app.fetch);

// Option 3: Native Bun
Bun.serve({
  port: 3000,
  fetch: app.fetch
});

// Option 4: Cloudflare Workers
export default {
  fetch: app.fetch
};

// Option 5: Vercel Edge Functions
export const GET = app.fetch;
export const POST = app.fetch;

// Option 6: Node.js http server
import { createServer } from 'http';
createServer(async (req, res) => {
  const response = await app.fetch(req);
  // Convert Response to Node.js response
});
```

**Use when:**
- You need custom server configuration
- You want more control over server startup
- You're deploying to edge runtimes (Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy)
- You're deploying to serverless platforms
- You're integrating with platform-specific features

## Configuration Examples

### Basic API Setup

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  port: 3000,
  debug: true
});
```

### Complete Configuration with HTTPS

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  middlewares: [LoggingMiddleware, AuthMiddleware],
  globalPipes: [ValidationPipe, TrimPipe],
  port: 443,
  hostname: 'api.example.com',
  tls: {
    cert: './certs/cert.pem',
    key: './certs/key.pem',
    passphrase: 'optional-passphrase'
  },
  runtimeOptions: {
    node: {
      http2: true,
      maxHeaderSize: 16384
    }
  },
  debug: false,
  environment: 'production',
  enableDecoratorValidation: true,
  injections: [
    { token: 'DATABASE_URL', provide: process.env.DATABASE_URL },
    { token: 'JWT_SECRET', provide: process.env.JWT_SECRET }
  ],
  swagger: {
    generate: true,
    path: '/api-docs',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Complete API with all features'
    }
  }
});
```

### Multi-Runtime Configuration

The same configuration works across Node.js, Deno, and Bun:

```typescript
// Works on Node.js, Deno, and Bun
yasui.createServer({
  controllers: [UserController],
  port: 3000,
  middlewares: [CorsMiddleware], // Use native YasuiJS middlewares
  debug: true
});
```

### Edge Runtime Deployment

For edge runtimes, use `createApp()` to get a standard fetch handler:

```typescript
const app = yasui.createApp({
  controllers: [UserController],
  middlewares: [CorsMiddleware]
});

// Deploy to Cloudflare Workers
export default { fetch: app.fetch };

// Deploy to Vercel Edge
export const GET = app.fetch;
export const POST = app.fetch;

// Deploy to Deno Deploy
Deno.serve(app.fetch);
```

## Debug Mode

Enable debug mode to see detailed information:

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true
});
```

Debug mode provides:
- Request/response logging
- Dependency injection details
- Route registration information
- Error stack traces
