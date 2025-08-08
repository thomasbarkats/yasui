# Middlewares

Middlewares process requests in a pipeline before they reach your controllers. They handle cross-cutting concerns like authentication, logging, validation, and request transformation.

## Overview

YasuiJS supports two types of middlewares:
- **Class-based middlewares** using the `@Middleware()` decorator
- **Express RequestHandler functions** for compatibility with existing Express middlewares

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

## Class-based Middlewares

### Middleware Decorator

The `@Middleware()` decorator marks a class as middleware. The class must implement a `use()` method. You can optionally implement the `IMiddleware` interface provided by YasuiJS to enforce the method signature.

```typescript
import { Middleware, IMiddleware, Request, Response, Req, Res } from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // Validate token logic here

    // Will continue to next middleware or controller logic if you return nothing/void
  }
}
```

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

## Express RequestHandler Middlewares

You can use standard Express middleware functions directly:

```typescript
import cors from 'cors';
import helmet from 'helmet';

yasui.createServer({
  middlewares: [
    cors(),
    helmet(),
  ]
});
```

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
