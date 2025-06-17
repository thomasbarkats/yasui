# Basic Concepts

This guide introduces the fundamental building blocks of YasuiJS. Understanding these concepts will help you build better APIs and make the most of the framework's features.

## Overview

YasuiJS is built around a few core concepts that work together to create a clean, maintainable API:

- **Controllers**: Handle HTTP requests and define your API endpoints
- **Services**: Contain your business logic and data operations
- **Decorators**: Provide metadata and configuration for your code
- **Dependency Injection**: Automatically manage dependencies between components
- **Middleware**: Process requests before they reach your controllers

Let's explore each of these concepts in detail.

## Controllers

Controllers are the entry points of your API. They receive HTTP requests and return responses. Think of them as the "traffic controllers" that direct requests to the right place.

### What is a Controller?

A controller is a TypeScript class that contains methods to handle different HTTP requests. Each method corresponds to an API endpoint.

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

### Controller Structure

Every controller follows this basic pattern:

1. **Class Declaration**: A TypeScript class with the `@Controller()` decorator
2. **Base Path**: The decorator specifies the base URL path for all routes in this controller
3. **Route Methods**: Methods decorated with HTTP method decorators like `@Get()`, `@Post()`, etc.

### Controller Features

Controllers in YasuiJS provide several benefits:

- **Route Grouping**: All routes in a controller share the same base path (e.g., `/users`)
- **Middleware Support**: Apply middleware to all routes in a controller
- **Dependency Injection**: Inject services and other dependencies
- **Type Safety**: Full TypeScript support with automatic type checking

### Example: User Management Controller

Here's a more complete example showing typical controller patterns:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from 'yasui';

interface User {
  id: string;
  name: string;
  email: string;
}

@Controller('/api/users')
export class UserController {
  
  // GET /api/users
  @Get('/')
  getUsers(@Query('page') page: number = 1) {
    // Handle getting users with pagination
    return { users: [], page };
  }

  // GET /api/users/:id
  @Get('/:id')
  getUser(@Param('id') id: string) {
    // Handle getting a specific user
    return { id, name: 'John Doe' };
  }

  // POST /api/users
  @Post('/')
  createUser(@Body() userData: { name: string; email: string }) {
    // Handle creating a new user
    return { message: 'User created', user: userData };
  }

  // PUT /api/users/:id
  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() userData: Partial<User>) {
    // Handle updating a user
    return { message: 'User updated', id, userData };
  }

  // DELETE /api/users/:id
  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    // Handle deleting a user
    return { message: 'User deleted', id };
  }
}
```

## Services

Services contain your business logic - the actual work your application does. They're separate from controllers to keep your code organized and testable.

### What is a Service?

A service is a class that contains methods for specific business operations. Services handle things like:
- Database operations
- External API calls
- Data processing and validation
- Business rules and calculations

### Service Example

```typescript
import { Injectable } from 'yasui';

interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  private users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  getUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  createUser(userData: { name: string; email: string }): User {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, userData: Partial<User>): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;
    
    this.users.splice(userIndex, 1);
    return true;
  }
}
```

### Service Best Practices

When creating services, follow these guidelines:

- **Single Responsibility**: Each service should handle one specific area of functionality
- **Stateless**: Services should generally not maintain state between requests
- **Injectable**: Always use the `@Injectable()` decorator to enable dependency injection
- **Testable**: Write services so they can be easily unit tested
- **Reusable**: Services can be used by multiple controllers

### Using Services in Controllers

Services are injected into controllers through the constructor:

```typescript
@Controller('/api/users')
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  @Post('/')
  createUser(@Body() userData: { name: string; email: string }) {
    return this.userService.createUser(userData);
  }
}
```

## Decorators

Decorators are the "magic" that makes YasuiJS work. They provide metadata about your classes, methods, and parameters, telling the framework how to handle them.

### What are Decorators?

Decorators are special functions that modify or provide information about classes, methods, or parameters. In YasuiJS, they're used to:
- Define routes and HTTP methods
- Extract request data
- Configure middleware
- Generate documentation

### Route Decorators

Route decorators define the HTTP endpoints and methods:

```typescript
@Get('/users')        // GET /users
@Post('/users')       // POST /users
@Put('/users/:id')    // PUT /users/:id
@Delete('/users/:id') // DELETE /users/:id
@Patch('/users/:id')  // PATCH /users/:id
```

### Parameter Decorators

Parameter decorators extract data from the HTTP request:

```typescript
@Param('id')          // Route parameter (e.g., /users/123)
@Query('page')        // Query string parameter (e.g., ?page=1)
@Body()               // Request body
@Header('token')      // Request header
@Req()                // Full request object
@Res()                // Response object
@Next()               // Next function
```

### Swagger Decorators

Swagger decorators generate API documentation:

```typescript
@ApiOperation('Get users', 'Retrieves all users')
@ApiResponse(200, 'Success')
@ApiParam('id', 'User ID', true)
@ApiBody('User data', UserSchema)
```

### Complete Decorator Example

Here's how all these decorators work together:

```typescript
@Controller('/api/users')
export class UserController {
  
  @Get('/')
  @ApiOperation('Get all users', 'Retrieves a list of all users')
  @ApiResponse(200, 'Success', [UserSchema])
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getUsers(page, limit);
  }

  @Post('/')
  @ApiOperation('Create user', 'Creates a new user')
  @ApiResponse(201, 'User created', UserSchema)
  @ApiResponse(400, 'Invalid data')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
}
```

## Dependency Injection

Dependency Injection (DI) is a design pattern that helps manage dependencies between components. YasuiJS includes a built-in DI system that automatically creates and injects dependencies.

### What is Dependency Injection?

Instead of manually creating dependencies, the framework creates them for you and injects them where needed. This makes your code more testable and maintainable.

### Basic Injection

The most common pattern is injecting services into controllers:

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

### How It Works

1. YasuiJS scans your controllers and services
2. It creates instances of services marked with `@Injectable()`
3. It automatically injects these services into controller constructors
4. You can use the injected services in your controller methods

### Custom Injection Tokens

You can also inject custom values using injection tokens:

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

Services can have different scopes that control how instances are created:

```typescript
@Injectable()
export class UserService {
  constructor(
    @Scope(Scopes.SINGLETON) private config: ConfigService
  ) {}
}
```

## Middleware

Middleware functions process requests before they reach your route handlers. They can modify the request, response, or stop the request entirely.

### What is Middleware?

Middleware functions run in sequence and can:
- Log requests
- Authenticate users
- Validate data
- Transform requests or responses
- Handle errors

### Controller-Level Middleware

Apply middleware to all routes in a controller:

```typescript
@Controller('/users', AuthMiddleware, LoggingMiddleware)
export class UserController {
  // All routes in this controller will use AuthMiddleware and LoggingMiddleware
}
```

### Route-Level Middleware

Apply middleware to specific routes:

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

Create your own middleware functions:

```typescript
import { Injectable } from 'yasui';

@Injectable()
export class AuthMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Add your token validation logic here
    if (token !== 'valid-token') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    next();
  }
}
```

### Middleware Order

Middleware runs in this order:
1. Global middleware (app-level)
2. Controller middleware
3. Route middleware
4. Route handler

## Configuration

YasuiJS applications are configured through a configuration object that controls various aspects of your application.

### Basic Configuration

```typescript
const config = {
  port: 3000,
  debug: true,
  cors: true,
  controllers: [UserController, ProductController],
  middleware: [GlobalMiddleware],
  swagger: {
    enabled: true,
    path: '/api-docs'
  }
};
```

### Configuration Options

- **port**: The port your server runs on
- **debug**: Enable debug mode for development
- **cors**: Enable CORS for frontend integration
- **controllers**: Array of controller classes to register
- **middleware**: Global middleware to apply to all requests
- **swagger**: Swagger documentation configuration

## Request/Response Flow

Understanding how requests flow through your application helps you debug and optimize:

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

Create custom error classes for different types of errors:

```typescript
export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  status = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}
```

### Error Handling in Controllers

Throw errors in your controllers and let the framework handle them:

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.getUserById(parseInt(id));
    
    if (!user) {
      throw new NotFoundError('User not found');
    }
    
    return user;
  }

  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    if (!userData.name || !userData.email) {
      throw new ValidationError('Name and email are required');
    }
    
    return this.userService.createUser(userData);
  }
}
```

## Type Safety

YasuiJS is built with TypeScript in mind and provides full type safety throughout your application.

### Type-Safe Parameters

Parameters are automatically typed based on your method signatures:

```typescript
@Post('/users')
createUser(@Body() userData: CreateUserDto) {
  // userData is fully typed as CreateUserDto
  return this.userService.createUser(userData);
}
```

### Type-Safe Responses

Return types are automatically inferred and validated:

```typescript
@Get('/users/:id')
getUser(@Param('id') id: string): User | null {
  // Return type is enforced
  return this.userService.getUserById(parseInt(id));
}
```

## Next Steps

Now that you understand the basic concepts, you can:

- [Learn about Decorators in detail](/decorators) - Complete reference for all decorators
- [Explore Dependency Injection patterns](/dependency-injection) - Advanced DI techniques
- [Master Middleware usage](/middleware) - Authentication, validation, and more
- [Configure your application](/configuration) - All configuration options
- [Handle errors properly](/error-handling) - Error handling best practices 