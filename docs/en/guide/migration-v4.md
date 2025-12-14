# Migration Guide: v3.x to v4.x

This guide helps you migrate from YasuiJS 3.x (Express-based) to YasuiJS 4.x (Web Standards with [SRVX](https://srvx.h3.dev)).

## Overview of Changes

YasuiJS 4.x represents a major architectural shift:

- **Removed Express dependency** - Now uses Web Standards
- **createServer()** - Uses [srvx](https://srvx.h3.dev) for Node.js, Deno, and Bun
- **createApp()** - Returns a standard fetch handler for any Web Standards platform
- **Edge-ready** - Deploy to Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy (via createApp)
- **Serverless compatible** - Works with AWS Lambda, Vercel Functions, Netlify Functions (via createApp)
- **Breaking changes** - Express middleware no longer compatible
- **New features** - TLS/HTTPS support, HTTP/2 on Node.js

## Breaking Changes

### 1. Express Middleware Not Compatible

**Before (v3.x):**
```typescript
import cors from 'cors';
import helmet from 'helmet';

yasui.createServer({
  middlewares: [cors(), helmet()]
});
```

**After (v4.x):**
Express middleware is **not compatible**. You must either:
1. Find Web Standards-compatible alternatives
2. Write native YasuiJS middlewares

```typescript
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

yasui.createServer({
  middlewares: [CorsMiddleware]
});
```

### 2. Response Object No Longer Supported

`@Res()` is **removed** - no longer supported.

**Before (v3.x):**
```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Res() res: Response) {
    if (!req.headers.authorization) {
      // Using @Res() was possible but not recommended
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }
}
```

**After (v4.x):**
```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request) {
    if (!req.headers.authorization) {
      // Throw errors or return Response objects
      throw new HttpError(401, 'Unauthorized');
    }
    // Will continue to next middleware or controller if you return nothing/void
  }
}
```

### 3. Request Object Changes

`@Req()` now provides a **truly web-standard Request object** with additional convenience properties.

**Native web-standard properties:**
- `req.body` - ReadableStream (web-standard)
- `req.headers` - Headers object (web-standard)
- `req.method`, `req.url` - Standard Request properties

**Additional convenience properties:**
- `req.parsedBody` - Parsed JSON body (cached)
- `req.flatHeaders` - Plain object for Express-style access
- `req.path` - Pathname without query string
- `req.hostname` - Host without port
- `req.protocol` - "http" or "https"
- `req.ip` - Client IP address
- `req.query` - Parsed query object
- `req.cookies` - Parsed cookies object
- `req.params` - Route parameters

**After (>= v4.3):**
```typescript
@Get('/users')
getUsers(@Req() req: Request) {
  // Web-standard Headers API (recommended)
  const auth = req.headers.get('authorization');

  // Or Express-style via flatHeaders
  const auth = req.flatHeaders['authorization'];

  // Convenience properties
  const page = req.query.page;
  const path = req.path;
}
```

**Note for versions < v4.3:**

Backward compatibility of header and body properties in Express format was initially proposed to prevent breaking changes, but this prevented true compatibility with Web Standards. It was therefore abandoned.

### 4. Custom Response Handling Changes

**Before (v3.x):**
```typescript
@Get('/custom')
customResponse(@Res() res: Response) {
  res.status(418).json({ message: "I'm a teapot" });
}
```

**After (v4.x):**
```typescript
@Get('/custom')
customResponse() {
  // Option 1: Return Web Standards Response
  return new Response(JSON.stringify({ message: "I'm a teapot" }), {
    status: 418,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 5. createApp() Return Type

**Before (v3.x):**
```typescript
import express from 'express';

const app = yasui.createApp({ controllers: [UserController] });
// app is Express Application

app.use(express.json());
app.listen(3000);
```

**After (v4.x):**
```typescript
import { serve } from 'srvx';

const app = yasui.createApp({ controllers: [UserController] });
// app is FetchHandler { fetch: Function }

serve({
  fetch: app.fetch,
  port: 3000
});
```

### 6. Configuration Changes

**Before (v3.x):**
```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [cors(), helmet()],
  protocol: 'http',
  port: 3000
});
```

**After (v4.x):**
```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [CorsMiddleware],  // Only YasuiJS middlewares
  port: 3000,
  tls: {  // New: TLS/HTTPS support
    cert: './cert.pem',
    key: './key.pem'
  },
  runtimeOptions: {  // New: Runtime-specific options
    node: {
      http2: true
    }
  }
});
```

**New options:**
- `tls` - TLS/HTTPS configuration
- `hostname` - Server hostname
- `runtimeOptions` - Runtime-specific configuration

**Deprecated:**
- `protocol` - Auto-determined by `tls` config

## Migration Steps

### Step 1: Update Dependencies

```bash
npm install yasui@latest
# or
pnpm update yasui
```

**Swagger UI Changes:**

YasuiJS v4 serves Swagger UI assets from CDN by default - **no additional packages needed**.

If you were using `swagger-ui-express` in v3:

```bash
npm uninstall swagger-ui-express
# or
pnpm remove swagger-ui-express
```

**No code changes needed** - Swagger UI works out of the box with zero configuration. The CDN approach also enables Swagger UI to work on all runtimes, including edge environments.

### Step 2: Remove Express Middleware

Identify all Express middleware in your codebase:

```typescript
// REMOVE these
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

yasui.createServer({
  middlewares: [cors(), helmet(), morgan('dev')]  // ❌ No longer works
});
```

### Step 3: Replace with Native Middlewares

Write YasuiJS middlewares for each feature:

```typescript
// Create native CORS middleware
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  }
}

yasui.createServer({
  middlewares: [CorsMiddleware]  // ✅ Works
});
```

### Step 4: Update Middleware Signatures

Remove `@Res()` usage from all middlewares: throw new HttpError for error status, or return value.

Remember: Middlewares work like controller methods. You don't need to call `next()` unless you want to modify the response.

### Step 6: Update Manual Response Handling

Replace Express response methods with Web Standards:

**Before:**
```typescript
@Get('/file')
downloadFile(@Res() res: Response) {
  res.sendFile('/path/to/file.pdf');
}

@Get('/redirect')
redirect(@Res() res: Response) {
  res.redirect('/new-location');
}
```

**After:**
```typescript
@Get('/file')
async downloadFile() {
  const file = await Deno.readFile('/path/to/file.pdf'); // or fs.readFile
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="file.pdf"'
    }
  });
}

@Get('/redirect')
redirect() {
  return new Response(null, {
    status: 302,
    headers: { 'Location': '/new-location' }
  });
}
```

### Step 7: Update createApp() Usage

If you were using `createApp()` for custom server setup:

**Before:**
```typescript
const app = yasui.createApp({ controllers: [UserController] });

app.use(express.static('public'));
app.listen(3000);
```

**After:**
```typescript
import { serve } from 'srvx';

const app = yasui.createApp({ controllers: [UserController] });

serve({
  fetch: app.fetch,
  port: 3000,
  static: {  // srvx static file serving
    '/': './public'
  }
});
```

### Step 8: Test Your Application

1. Start your server
2. Test all endpoints
3. Verify middleware behavior
4. Check error handling
5. Test with different runtimes (Node.js, Deno, Bun)

## New Features in v4.x

### TLS/HTTPS Support

```typescript
yasui.createServer({
  controllers: [UserController],
  port: 443,
  tls: {
    cert: './certs/cert.pem',
    key: './certs/key.pem',
    passphrase: 'optional'
  }
});
```

### HTTP/2 Support (Node.js)

```typescript
yasui.createServer({
  controllers: [UserController],
  tls: {
    cert: './cert.pem',
    key: './key.pem'
  },
  runtimeOptions: {
    node: {
      http2: true  // Enabled by default with TLS
    }
  }
});
```

### Multi-Runtime & Edge Deployment

Same code works across runtimes and platforms:

```typescript
// Traditional runtimes
// Works on Node.js, Deno, and Bun
yasui.createServer({
  controllers: [UserController],
  port: 3000
});

// Edge runtimes - use createApp()
const app = yasui.createApp({
  controllers: [UserController]
});

// Cloudflare Workers
export default {
  fetch: app.fetch
};

// Vercel Edge Functions
export const GET = app.fetch;
export const POST = app.fetch;

// Deno Deploy
Deno.serve(app.fetch);

// Netlify Edge Functions
export default app.fetch;
```

### Deploy Anywhere

Since YasuiJS returns a standard fetch handler, you can deploy to:
- **Traditional servers**: Node.js, Deno, Bun
- **Edge runtimes**: Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy
- **Serverless**: AWS Lambda (with adapters), Vercel Functions, Netlify Functions
- **Any platform** that supports Web Standards fetch handlers

## Getting Help

If you encounter issues during migration:

1. Check the [documentation](/reference/config)
2. Review the [examples](https://github.com/thomasbarkats/yasui/tree/main/src/example)
3. Open an issue on [GitHub](https://github.com/thomasbarkats/yasui/issues)
