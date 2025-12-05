# Middlewares

Middlewares process requests in a pipeline before they reach your controllers. They handle cross-cutting concerns like authentication, logging, validation, and request transformation.

## Overview

YasuiJS supports two types of middlewares, both built on Web Standards and compatible with all runtimes (Node.js, Deno, Bun):

1. **Class-based middlewares** - Use the `@Middleware()` decorator with dependency injection support
2. **Functional middlewares** - Simple functions following the Web Standards `Request → Response` pattern

**Important**: YasuiJS 4.x uses Web Standards Request/Response instead of Express. Express-style middlewares (like `cors`, `helmet`, etc.) are **not compatible**. Use Web Standards-compatible alternatives or write native YasuiJS middlewares.

Middlewares can be applied at three levels with different execution priorities:
1. **Application level** - Applied to all requests
2. **Controller level** - Applied to all routes in a controller
3. **Endpoint level** - Applied to specific routes

```typescript
import { Middleware } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use() {
    console.log('Request received');
  }
}
```

## Functional Middlewares

Functional middlewares are simple functions that follow the Web Standards `Request → Response` pattern. They're perfect for third-party integrations, stateless operations, or when you don't need dependency injection.

```typescript
import type { YasuiRequest, RequestHandler, NextFunction } from 'yasui';

export function simpleLogger(): RequestHandler {
  return async (req: YasuiRequest, next?: NextFunction): Promise<Response> => {
    console.log(`${req.method} ${req.path}`);
    return next ? next() : new Response(null, { status: 500 });
  };
}

// Usage
yasui.createServer({
  middlewares: [simpleLogger()],
  controllers: [UserController]
});
```

**Third-party compatibility:** Functional middlewares work with any library providing Web Standards handlers, such as authentication libraries (e.g., BetterAuth's `auth.handler()`), official plugins, or custom fetch-compatible handlers.

**When to use:**
- Third-party integrations (BetterAuth, etc.)
- Stateless operations (logging, CORS, rate limiting)
- No dependency injection needed

**When to use classes:**
- Need dependency injection (`@Inject()`)
- Access to services/database
- Complex business logic with shared state

## Class-based Middlewares

### Middleware Decorator

The `@Middleware()` decorator marks a class as middleware. The class must implement a `use()` method. You can optionally implement the `IMiddleware` interface provided by YasuiJS to enforce the method signature.

```typescript
import { Middleware, IMiddleware, Request, Req } from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(@Req() req: Request) {
    const token = req.rawHeaders.get('authorization');

    if (!token) {
      throw new HttpError(401, 'Unauthorized');
    }
    // Validate token logic here

    // Will continue to next middleware or controller if you return nothing/void
  }
}
```

**Note:** Middlewares work like controller methods - you can return values, throw errors, or return nothing to continue. Using `@Next()` is optional if you need manual control over the execution flow.

### Parameter Decorators in Middlewares

Middlewares can use the same parameter decorators as controllers and benefit from automatic error catching too:

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new HttpError(400, 'Invalid request data');
    }
  }

  private isValid(data: any): boolean {
    // Validation logic
    return true;
  }
}
```

**Automatic Type Casting:** All parameter decorators in middlewares benefit from the same automatic type casting as controllers. Parameters are cast to their specified types before middleware execution.

### Dependency Injection

As Middleware classes act like Controllers, they also allow dependency injection in the same way:

```typescript
@Middleware()
export class LoggingMiddleware {
  constructor (
    private validationService: ValidationService, // Standard injection
    @Inject('CONFIG') private config: AppConfig, // Pre-registered custom injection
  ) {}

  use(
    @Body() body: any,
    @Inject() anotherService: AnotherService, // Same at method level
  ) {
    if (!this.validationService.isValid(body)) {
      throw new HttpError(400, 'Invalid request data');
    }
  }
}
```

## Writing Custom Middlewares

You can create middlewares for common use cases. Here are two patterns:

### Pattern 1: Simple Validation (No @Next() needed)

```typescript
@Middleware()
export class ApiKeyMiddleware implements IMiddleware {
  use(@Header('x-api-key') apiKey: string) {
    if (!apiKey || apiKey !== 'expected-key') {
      throw new HttpError(401, 'Invalid API key');
    }
    // Will continue automatically
  }
}
```

### Pattern 2: Response Modification (Using @Next())

When you need to modify the response, use `@Next()`:

```typescript
@Middleware()
export class TimingMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const start = Date.now();
    const response = await next();
    const duration = Date.now() - start;

    const headers = new Headers(response.headers);
    headers.set('X-Response-Time', `${duration}ms`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
}
```

**For production-ready CORS handling**, use the official [`@yasui/cors`](/plugins/cors) plugin which provides origin validation, preflight handling, credentials support, and modern security features.

## Middleware Usage Levels

### Application Level

Applied to all requests across your entire application:

```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, SecurityMiddleware]
});
```

### Controller Level

Applied to all routes within a specific controller:

```typescript
// Single middleware
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // All routes require authentication
}

// Multiple middlewares
@Controller('/api/admin', AuthMiddleware, ValidationMiddleware)
export class AdminController {
  // All routes have auth + validation
}
```

### Endpoint Level

Applied to specific routes only:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // No middleware
  }
  
  @Post('/', ValidationMiddleware)
  createUser() {
    // Only validation middleware
  }
  
  @Delete('/:id', AuthMiddleware, ValidationMiddleware)
  deleteUser() {
    // Both auth and validation middlewares
  }
}
```

## Execution Order

Middlewares execute in this order:

1. **Application middlewares** (in registration order)
2. **Controller middlewares** (in declaration order)
3. **Endpoint middlewares** (in declaration order)
4. **Controller method**

```typescript
// Execution order example:
yasui.createServer({
  middlewares: [GlobalMiddleware] // 1. First
});

@Controller('/users', ControllerMiddleware) // 2. Second
export class UserController {
  @Post('/', EndpointMiddleware) // 3. Third
  createUser() {
    // 4. Finally the controller method
  }
}
```
