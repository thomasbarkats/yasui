# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Yasui** is a lightweight multi-runtime framework for building REST and web APIs with TypeScript. It emphasizes decorator-driven architecture, dependency injection, automatic type casting, and OpenAPI documentation generation. Built on Web Standards with srvx for multi-runtime compatibility.

- **Version**: 3.0.3
- **Node**: >=18.0.0 (also supports Deno and Bun)
- **Core Dependencies**: srvx, radix3, reflect-metadata, kleur
- **License**: AGPL-3.0-or-later

## Architecture Principles

1. **Multi-Runtime**: Works on Node.js, Deno, and Bun via srvx and Web Standards
2. **Decorator-Driven**: Class-based architecture with extensive decorator support
3. **Dependency Injection**: Built-in DI system with three scopes (SHARED, LOCAL, DEEP_LOCAL)
4. **Type Safety**: TypeScript-first with automatic type casting for route parameters
5. **Auto-Documentation**: Swagger/OpenAPI generation from decorators
6. **Minimal Dependencies**: Lightweight core with focused feature set

## Directory Structure

```
src/
├── decorators/          # All decorator implementations
│   ├── controller.decorator.ts    # @Controller
│   ├── methods.decorator.ts       # @Get, @Post, @Put, @Delete, @Patch
│   ├── injectable.decorator.ts    # @Injectable, @Inject, @Scope
│   ├── params.decorator.ts        # @Req, @Res, @Body, @Query, @Param, @Header, @Logger
│   ├── middleware.decorator.ts    # @Middleware
│   ├── pipes.decorator.ts         # @PipeTransform, @UsePipes
│   └── swagger.decorator.ts       # @ApiOperation, @ApiResponse, etc.
├── services/            # Core services
│   ├── logger.service.ts          # LoggerService with timing
│   └── config.service.ts          # ConfigService for env vars
├── utils/               # Core utilities
│   ├── route-handler.ts           # Request handler creation, param binding, type casting
│   ├── app.service.ts             # Core app functionality
│   ├── error.resource.ts          # Error handling and formatting
│   ├── swagger.service.ts         # OpenAPI generation
│   └── decorator-validator.ts     # Decorator validation
├── core.ts              # Framework orchestration
├── injector.ts          # Dependency injection engine
├── base.ts              # createServer() and createApp() entry points
├── web.ts               # YasuiRequest (Web Standards Request with extensions)
├── example/             # Example implementation
└── index.ts             # Main entry point (re-exports)
```

## Core Concepts

### 1. Dependency Injection (injector.ts)

Three scopes available:
- **SHARED** (default): Singleton - one instance for entire app
- **LOCAL**: Fresh instance per injection context
- **DEEP_LOCAL**: Fresh instance + propagates locality to dependencies

Key methods:
```typescript
Injector.build<T>(Class, scope?)   // Build instance with dependencies
Injector.register(token, instance) // Manual registration
Injector.get<T>(token)             // Retrieve instance
```

### 2. Decorators

**Class Decorators:**
- `@Controller(path, ...middlewares)` - Define route base path
- `@Injectable()` - Enable dependency injection
- `@Middleware()` - Mark as middleware with `use()` method

**Method Decorators:**
- `@Get(path, ...middlewares)`, `@Post()`, `@Put()`, `@Delete()`, `@Patch()`
- `@HttpStatus(code)` - Custom response status

**Parameter Decorators:**
- `@Req()` - YasuiRequest (Web Standard Request with extensions)
- `@Res()`, `@Next()` - **DEPRECATED** (use return values and async/await)
- `@Param(name)`, `@Query(name)`, `@Header(name)` - With auto type casting
- `@Body(name?)` - Request body (full or property)
- `@Logger()` - Per-request LoggerService
- `@Inject(token?)` - Dependency injection

**Swagger Decorators:**
- `@ApiOperation(summary, description, tags)`
- `@ApiResponse(status, description, definition)`
- `@ApiBody()`, `@ApiParam()`, `@ApiQuery()`, `@ApiHeader()`
- `@ApiProperty(def, required?)` / `@AP` - For DTOs
- `@ApiPropertyOptional(def)` / `@APO` - Optional properties

### 3. Request Lifecycle

```
Request → Body Parser → API Key Auth → Debug Logging
→ Global Middlewares → Controller Middlewares → Route Middlewares
→ Pipes (validation/transform) → DI Resolution → Handler Execution
→ JSON Response → Error Handler (if thrown) → 404 Handler (if no match)
```

### 4. Type Casting (route-handler.ts)

Automatic type casting for `@Param()`, `@Query()`, `@Header()`:
- `Number` → `Number(value)`
- `Boolean` → `value === 'true' || value === '1'`
- `Date` → `new Date(value)`
- `Array` → Parse comma-separated or JSON array
- Custom classes → JSON.parse() with fallback

### 5. Error Handling

- Throw errors naturally (framework catches them)
- Use `HttpError(status, message)` for custom status codes
- Errors are caught using Promise `.catch()` chains (not try-catch with return await)
- Error response format:
  ```typescript
  {
    url, path, method, status, statusMessage,
    message, name, data
  }
  ```

### 6. YasuiRequest (web.ts)

YasuiRequest extends Web Standards Request with Express-compatible properties:

**Standard Properties:**
- `req.url` - Full URL string
- `req.method` - HTTP method
- `req.params` - Route parameters (Yasui custom)
- `req.logger` - Per-request LoggerService
- `req.source` - Controller/middleware name

**Express-Compatible Properties (added for migration ease):**
- `req.path` - Pathname without query string (e.g., "/users/123")
- `req.hostname` - Host from Host header, without port
- `req.protocol` - "http" or "https" (checks X-Forwarded-Proto)
- `req.ip` - Client IP (checks X-Forwarded-For, X-Real-IP headers)
- `req.query` - Parsed query string object (cached)
- `req.cookies` - Parsed cookies object
- `req.body` - Parsed request body (after `await req.json()`)
- `req.headers` - Returns plain object for property access (e.g., `req.headers.host` or `req.headers['content-type']`)

**Important Notes:**
- `req.headers` intentionally overrides Web Standards Headers type for Express compatibility
- `req.body` shadows Web Standards Request.body (ReadableStream) to return parsed JSON
- All properties are cached/lazy-loaded for performance

### 7. HTTPS/TLS Configuration

Yasui supports HTTPS with automatic HTTP/2 (Node.js):

```typescript
createServer({
  controllers: [UserController],
  port: 443,
  tls: {
    cert: './path/to/cert.pem',    // or inline PEM string
    key: './path/to/key.pem',      // or inline PEM string
    passphrase: 'optional',         // optional key passphrase
    ca: './path/to/ca.pem',        // optional CA certificates
  },
  runtimeOptions: {
    node: {
      http2: true,              // default: true (auto-enabled with TLS)
      maxHeaderSize: 16384,     // optional: customize header size
      ipv6Only: false,          // optional: IPv6-only mode
    }
  }
});
```

**Protocol Detection:**
- If `tls` is configured → automatically uses HTTPS
- If `tls` is not configured → uses HTTP
- `protocol` field is deprecated (but kept for backward compatibility)

**Runtime Support:**
- **Node.js**: Full HTTPS + HTTP/2 support
- **Deno**: HTTPS support
- **Bun**: HTTPS support (HTTP/2 not yet available in Bun.serve())

## Breaking Changes from Express

**Important:** Yasui 3.x migrated from Express to SRVX (Web Standards). This introduces breaking changes:

### Express Middleware Incompatibility

Express-style middlewares (like `cors`, `helmet`, etc.) are **not compatible** with Yasui's Web Standards-based architecture.

**Why?**
- Express uses mutable req/res objects with methods like `res.setHeader()`, `res.send()`
- Web Standards use immutable Request/Response objects
- Express uses callback-based `next()`, Web Standards use Promise-based flow

**Solution:**
- Use Web Standards-compatible libraries (e.g., packages that work with Fetch API)
- Write native Yasui middlewares that return Response objects
- Most security middlewares (CORS, Helmet) are simple header manipulation - easy to implement

**Example Native Middleware:**
```typescript
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction): Promise<Response> {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  }
}
```

## Common Patterns

### Controller Example
```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:id')
  @ApiOperation('Get user', 'Retrieve user by ID')
  @ApiParam('id', 'User ID', true, { type: 'string' })
  @ApiResponse(200, 'User found', UserDto)
  async getUser(@Param('id') id: string): Promise<UserDto> {
    return this.userService.getById(id);
  }
}
```

### Service Example
```typescript
@Injectable()
export class UserService {
  constructor(
    private logger: LoggerService,
    private config: ConfigService
  ) {}

  getById(id: string): UserDto {
    this.logger.log(`Fetching user ${id}`);
    // Implementation
  }
}
```

### Middleware Example
```typescript
@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Inject() authService: AuthService,
    @Next() next: NextFunction
  ): void {
    if (authService.verify(req)) {
      next();
    } else {
      throw new HttpError(401, 'Unauthorized');
    }
  }
}
```

### Server Setup (HTTP)
```typescript
createServer({
  controllers: [UserController],
  middlewares: [AuthMiddleware],
  globalPipes: [ValidationPipe],
  port: 3000,
  debug: true,
  swagger: {
    generate: true,
    path: '/api-docs'
  }
});
```

### Server Setup (HTTPS with HTTP/2)
```typescript
createServer({
  controllers: [UserController],
  middlewares: [AuthMiddleware],
  port: 443,
  tls: {
    cert: './cert.pem',
    key: './key.pem',
  },
  runtimeOptions: {
    node: {
      http2: true,  // auto-enabled by default
    }
  },
  swagger: {
    generate: true,
    path: '/api-docs'
  }
});
```

## Development Conventions

### Naming
- Controllers: `*Controller` (e.g., UserController)
- Services: `*Service` (e.g., UserService)
- Middlewares: `*Middleware` (e.g., AuthMiddleware)
- Pipes: `*Pipe` (e.g., ValidationPipe)
- DTOs: `*Dto`, `*Response` (e.g., UserDto)

### File Organization
- One class per file
- Interfaces: `*.i.ts`
- Enums: `*.enum.ts`
- Group related logic in services
- Controllers handle HTTP only

### Best Practices
- Mark injectable classes with `@Injectable()`
- Prefer constructor injection over method injection
- Use method injection for request-scoped data (e.g., `@Logger()`)
- Use LOCAL scope for request-specific instances
- Controllers should be thin - delegate to services
- Throw errors naturally - framework handles them
- Use TypeScript strictly for type safety
- Document APIs with Swagger decorators

## Key Files Reference

### Core Framework
- `src/core.ts` - Framework orchestration, middleware chain execution
- `src/injector.ts` - DI engine implementation
- `src/base.ts` - Entry point functions (createServer, createApp)
- `src/web.ts` - YasuiRequest class with Web Standards + Express-compatible properties

### Request Handling
- `src/utils/route-handler.ts` - Parameter binding, type casting, decorator path traversal
- `src/utils/app.service.ts` - Request lifecycle management, error handling
- `src/utils/error.resource.ts` - Error formatting

### Decorators
- `src/decorators/controller.decorator.ts` - Route registration
- `src/decorators/methods.decorator.ts` - HTTP methods
- `src/decorators/params.decorator.ts` - Parameter extraction
- `src/decorators/injectable.decorator.ts` - DI configuration

### Documentation
- `src/utils/swagger.service.ts` - OpenAPI generation
- `src/decorators/swagger.decorator.ts` - Swagger decorators

### Examples
- `src/example/app.ts` - Server setup example
- `src/example/tests.controller.ts` - Controller patterns
- `src/example/tests.service.ts` - Service patterns

## Metadata System

Uses `reflect-metadata` with custom keys (enums/reflect.enum.ts):
- `DESIGN_PARAM_TYPES` - Constructor parameter types
- `PRE_INJECTED_DEPS` - Custom token injections
- `ROUTES` - Controller route metadata
- `PARAMS` - Route parameter metadata
- `INJECTABLE` - Injectable flag
- `SWAGGER_*` - API documentation metadata

## Build & Development

### Scripts
- `pnpm build` - Build TypeScript to lib/
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm example` - Build and run example app
- `pnpm docs:dev` - Start VitePress docs server

### Build Process
- Source: `src/` (TypeScript)
- Output: `lib/` (JavaScript + types)
- Uses custom build script (scripts/build.sh)
- Generates bundled types with rollup-plugin-dts

## Important Notes

1. **reflect-metadata**: Must be imported once at app entry
2. **Type Casting**: Only works with TypeScript type annotations
3. **Circular Dependencies**: Avoided by using LOCAL scope
4. **Error Handling**: All errors caught by framework using Promise `.catch()` chains
5. **Middleware Order**: Global → Controller → Route level
6. **Scope Defaults**: SHARED for services, no scope inheritance unless DEEP_LOCAL
7. **Express Middlewares**: Not compatible - use Web Standards-based alternatives
8. **Async Error Handling**: Use `return await` in try-catch blocks or `.catch()` chains for proper error catching
9. **TLS/HTTPS**: Automatically enabled when `tls` config is provided
10. **HTTP/2**: Auto-enabled on Node.js when using TLS (can be disabled via runtimeOptions)

## Testing Considerations

When working with this codebase:
- Test DI resolution for complex dependency trees
- Verify type casting for edge cases (null, undefined, invalid formats)
- Test middleware execution order
- Validate Swagger documentation generation
- Check error handling and status codes
- Test all decorator combinations

## External Documentation

- GitHub: https://github.com/thomasbarkats/yasui
- Homepage: https://yasui.app
- Issues: https://github.com/thomasbarkats/yasui/issues
