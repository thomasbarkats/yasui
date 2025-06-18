# Middleware Reference

This reference covers all middleware-related features in YasuiJS.

## Middleware Types

- **Global Middleware**: Runs on every request. Registered in the `middlewares` array in the config.
- **Controller Middleware**: Runs on all routes in a controller. Registered via the `@Controller` decorator or `@Middleware` decorator at the class level.
- **Route Middleware**: Runs on a specific route. Registered via the `@Middleware` or `@Use` decorator at the method level.

## Middleware Definition

A middleware is a class with a `run` method:

```typescript
import { Request, Response, NextFunction } from 'express';

export class MyMiddleware {
  run(req: Request, res: Response, next: NextFunction): void | Promise<void> {
    // ...
    next();
  }
}
```

- The `run` method can be synchronous or async.
- You can use dependency injection in the constructor.

## Registering Middleware

### Global Middleware
Add to the `middlewares` array in your YasuiJS config:

```typescript
const config = {
  controllers: [UserController],
  middlewares: [MyMiddleware]
};
```

### Controller Middleware
Apply to all routes in a controller:

```typescript
@Controller('/users', MyMiddleware)
export class UserController {}
```
Or:
```typescript
@Middleware([MyMiddleware])
export class UserController {}
```

### Route Middleware
Apply to a specific route:

```typescript
@Middleware([MyMiddleware])
@Get('/')
getUsers() {}
```
Or:
```typescript
@Use(MyMiddleware)
@Get('/')
getUsers() {}
```

## Middleware Decorators

- `@Middleware(middlewares: Middleware[])`: Apply one or more middleware classes to a controller or route.
- `@Use(middleware: Middleware)`: Apply a single middleware class to a route.

## Middleware Signature

```typescript
class MyMiddleware {
  run(req: Request, res: Response, next: NextFunction): void | Promise<void>;
}
```

## Notes
- Middleware can be a class with a `run` method or a plain Express middleware function.
- Middleware can be async.
- Middleware can use dependency injection if defined as a class. 