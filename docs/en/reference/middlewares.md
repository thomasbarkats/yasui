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
import { Middleware, NextFunction } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use(@Next() next: NextFunction) {
    console.log('Request received');
    next();
  }
}
```

## Class-based Middlewares

### Middleware Decorator

- `@Middleware()` - Mark a class as middleware (no parameters)

The `@Middleware()` decorator defines a class as middleware. The class must implement a `use()` method. You can optionally implement the `IMiddleware` interface provided by YasuiJS to enforce the method signature.

```typescript
import { Middleware, IMiddleware, Req, Res, Next } from 'yasui';
import { Request, Response, NextFunction } from 'express';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Validate token logic here
    next(); // Continue to next middleware or controller
  }
}
```

### Parameter Decorators in Middlewares

Middlewares can use the same parameter decorators as controllers:

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string,
    @Next() next: NextFunction
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new Error('Invalid request data');
    }
    
    next();
  }
  
  private isValid(data: any): boolean {
    // Validation logic
    return true;
  }
}
```

### Middleware Execution

You must explicitly call `next()` to continue to the next middleware or controller. To stop the request pipeline, either:
- Return a response using `@Res()`
- Throw an error
- Don't call `next()`

```typescript
@Middleware()
export class ConditionalMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    if (req.path === '/public') {
      next(); // Continue pipeline
    }
    // Don't call next() to stop here
  }
}
```

## Express RequestHandler Middlewares

You can use standard Express middleware functions directly:

```typescript
import cors from 'cors';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Function middleware
function customMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.path}`);
  next();
}

// Function that returns middleware
function rateLimiter(maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Rate limiting logic
    next();
  };
}

yasui.createServer({
  middlewares: [
    cors(),
    helmet(),
    customMiddleware,
    rateLimiter(100)
  ]
});
```

## Middleware Usage Levels

### Application Level

Applied to all requests across your entire application:

```typescript
import yasui from 'yasui';
import { LoggingMiddleware, SecurityMiddleware } from './middleware';

yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, SecurityMiddleware]
});
```

### Controller Level

Applied to all routes within a specific controller:

```typescript
import { AuthMiddleware, ValidationMiddleware } from './middleware';

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
import { AuthMiddleware, ValidationMiddleware } from './middleware';

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
