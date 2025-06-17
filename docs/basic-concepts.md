# Basic Concepts

This guide introduces the fundamental concepts of YasuiJS that you'll use throughout your application development.

## Controllers

Controllers are the heart of your YasuiJS application. They handle incoming HTTP requests and return responses. Controllers are classes decorated with `@Controller()` that contain route handlers.

### Basic Controller Structure

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/users')
export class UserController {
  
  @Get('/')
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }

  @Post('/')
  createUser() {
    return { message: 'User created' };
  }
}
```

### Controller Features

- **Route Grouping**: All routes in a controller share the same base path
- **Middleware Support**: Apply middleware to all routes in a controller
- **Dependency Injection**: Inject services and other dependencies
- **Type Safety**: Full TypeScript support with type checking

## Services

Services contain your business logic and are typically injected into controllers. They should be decorated with `@Injectable()` to enable dependency injection.

### Service Example

```typescript
import { Injectable } from 'yasui';

@Injectable()
export class UserService {
  private users = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' }
  ];

  getUsers() {
    return this.users;
  }

  getUserById(id: number) {
    return this.users.find(user => user.id === id);
  }

  createUser(userData: { name: string }) {
    const newUser = {
      id: this.users.length + 1,
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }
}
```

### Service Best Practices

- Keep business logic in services, not controllers
- Make services focused and single-purpose
- Use dependency injection for service dependencies
- Keep services stateless when possible

## Decorators

Decorators are the core feature of YasuiJS that make your code declarative and readable. They provide metadata about your classes, methods, and parameters.

### Route Decorators

```typescript
@Get('/users')        // GET /users
@Post('/users')       // POST /users
@Put('/users/:id')    // PUT /users/:id
@Delete('/users/:id') // DELETE /users/:id
@Patch('/users/:id')  // PATCH /users/:id
```

### Parameter Decorators

```typescript
@Param('id')          // Route parameter
@Query('page')        // Query string parameter
@Body()               // Request body
@Header('token')      // Request header
@Req()                // Full request object
@Res()                // Response object
@Next()               // Next function
```

### Swagger Decorators

```typescript
@ApiOperation('Get users', 'Retrieves all users')
@ApiResponse(200, 'Success')
@ApiParam('id', 'User ID', true)
@ApiBody('User data', UserSchema)
```

## Dependency Injection

YasuiJS includes a built-in dependency injection system that automatically resolves and injects dependencies.

### Basic Injection

```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

### Custom Injection Tokens

```typescript
@Controller('/users')
export class UserController {
  constructor(
    @Inject('DATABASE') private db: Database,
    private userService: UserService
  ) {}
}
```

### Injection Scopes

```typescript
@Injectable()
export class UserService {
  constructor(
    @Scope(Scopes.SINGLETON) private config: ConfigService
  ) {}
}
```

## Middleware

Middleware functions run before your route handlers and can modify the request, response, or call the next middleware.

### Controller-Level Middleware

```typescript
@Controller('/users', AuthMiddleware, LoggingMiddleware)
export class UserController {
  // All routes in this controller will use AuthMiddleware and LoggingMiddleware
}
```

### Route-Level Middleware

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/')
  @Use(AuthMiddleware)
  getUsers() {
    return this.userService.getUsers();
  }
}
```

### Custom Middleware

```typescript
import { Injectable } from 'yasui';

@Injectable()
export class AuthMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
  }
}
```

## Configuration

YasuiJS applications are configured through a configuration object passed to the `Core` class.

### Basic Configuration

```typescript
const config = {
  controllers: [UserController, ProductController],
  middlewares: [GlobalMiddleware],
  swagger: {
    generate: true,
    info: {
      title: 'My API',
      version: '1.0.0'
    }
  },
  debug: true
};
```

### Configuration Options

- **controllers**: Array of controller classes
- **middlewares**: Global middleware classes
- **swagger**: Swagger documentation configuration
- **debug**: Enable debug mode for development
- **apiKey**: API key for authentication
- **injections**: Custom dependency injection tokens

## Request/Response Flow

1. **Request arrives** at the server
2. **Global middleware** processes the request
3. **Route matching** finds the appropriate controller and method
4. **Controller middleware** runs (if any)
5. **Route middleware** runs (if any)
6. **Parameter extraction** using decorators
7. **Dependency injection** resolves method parameters
8. **Route handler** executes
9. **Response** is sent back to the client

## Error Handling

YasuiJS provides built-in error handling that automatically catches and processes errors.

### Custom Error Classes

```typescript
export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Error Handling in Controllers

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.getUserById(parseInt(id));
    if (!user) {
      throw new ValidationError('User not found');
    }
    return user;
  }
}
```

## Type Safety

YasuiJS is built with TypeScript in mind and provides full type safety throughout your application.

### Type-Safe Parameters

```typescript
@Post('/users')
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

### Type-Safe Responses

```typescript
@Get('/users/:id')
getUser(@Param('id') id: string): User | null {
  return this.userService.getUserById(parseInt(id));
}
```

## Next Steps

Now that you understand the basic concepts, you can:

- [Learn about Decorators in detail](/guide/decorators)
- [Explore Dependency Injection patterns](/guide/dependency-injection)
- [Master Middleware usage](/guide/middleware)
- [Configure your application](/guide/configuration) 