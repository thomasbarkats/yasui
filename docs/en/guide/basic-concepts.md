# Basic Concepts

This guide introduces the fundamental concepts that make YasuiJS work. Understanding these concepts will help you build better APIs and make the most of the framework's architecture.

## Overview

YasuiJS is built around some core concepts:

- **Controllers**: Define your API endpoints and handle HTTP requests
- **Services**: Contain your business logic and data operations  
- **Dependency Injection**: Automatically manage relationships between components
- **Decorators**: Provide metadata and configuration declaratively
- **Middleware**: Process requests in a pipeline before reaching controllers

## Controllers

**Controllers are the entry points of your API.** They define what endpoints exist and how to respond to HTTP requests.

### What Controllers Do

Controllers have one primary responsibility: translate HTTP requests into business operations and return appropriate responses. They should be thin layers that delegate actual work to services.

```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Why Controllers Matter

- **Route Organization**: Group related endpoints together logically
- **Request Handling**: Extract and validate request data automatically
- **Response Formatting**: Return data that gets automatically serialized
- **Separation of Concerns**: Keep HTTP logic separate from business logic

Controllers should focus on HTTP concerns (routing, status codes, headers) while delegating business logic to services.

## Services

**Services contain your business logic.** They perform the actual work your application needs to do, independent of how that work was requested.

### What Services Do

Services encapsulate business operations and can be used by multiple controllers. They handle things like data processing, external API calls, and business rules.

```typescript
@Injectable()
export class UserService {
  private users = [];

  getAllUsers() {
    return this.users;
  }

  createUser(userData) {
    // Business logic here
    const user = { id: generateId(), ...userData };
    this.users.push(user);
    return user;
  }
}
```

### Why Services Matter

- **Reusability**: Multiple controllers can use the same service
- **Testability**: Business logic can be tested independently of HTTP
- **Organization**: Related business operations are grouped together
- **Maintainability**: Changes to business logic don't affect controllers

Services should focus on "what" your application does, not "how" it's accessed.

## Dependency Injection

**Dependency Injection automatically manages relationships between components.** Instead of manually creating and connecting objects, YasuiJS does it for you.

### How It Works

When YasuiJS sees a controller that needs a service, it automatically creates the service and injects it:

```typescript
@Injectable()
export class UserService {
  // Service implementation
}

@Controller('/users')
export class UserController {
  // UserService is automatically created and injected
  constructor(private userService: UserService) {}
}
```

### Why Dependency Injection Matters

- **Loose Coupling**: Components don't create their own dependencies
- **Testability**: Easy to replace dependencies with mocks for testing
- **Flexibility**: Change implementations without modifying consumers
- **Lifecycle Management**: Framework handles object creation and cleanup

You declare what you need, and the framework figures out how to provide it.

## Decorators

**Decorators provide metadata about your code.** They tell YasuiJS how to interpret and configure your classes and methods.

### What Decorators Do

Decorators replace configuration files and manual setup with declarative annotations:

```typescript
@Controller('/api/users')    // This class handles /api/users routes
export class UserController {
  
  @Get('/:id')              // This method handles GET requests
  getUser(@Param('id') id: string) {  // Extract 'id' from URL
    return { id, name: 'John' };
  }
}
```

### Types of Decorators

- **Class Decorators**: `@Controller()`, `@Injectable()`, `@Middleware()` - define what a class represents
- **Method Decorators**: `@Get()`, `@Post()`, `@Put()` - define HTTP methods and routes
- **Parameter Decorators**: `@Param()`, `@Body()`, `@Query()` - extract request data

### Why Decorators Matter

- **Declarative**: Code clearly states its intent
- **Co-location**: Configuration lives next to the code it configures
- **Type Safety**: TypeScript can validate decorator usage
- **Automatic Processing**: Framework reads decorators and configures everything

Decorators make your code self-documenting and eliminate manual wiring.

## Middleware

**Middleware processes requests in a pipeline.** Each middleware can examine, modify, or stop a request before it reaches your controller.

### How Middleware Works

Middleware functions run in sequence, each deciding whether to continue to the next step:

```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    // Check authentication
    if (req.headers.authorization) {
      next(); // Continue to next middleware or controller
    } else {
      throw new Error('Unauthorized'); // Stop here
    }
  }
}
```

### Middleware Levels

Middleware can be applied at different levels:

```typescript
// Global: applies to all requests
yasui.createServer({
  middlewares: [LoggingMiddleware]
});

// Controller: applies to all routes in controller
@Controller('/users', AuthMiddleware)
export class UserController {}

// Route: applies to specific endpoint
@Get('/', ValidationMiddleware)
getUsers() {}
```

### Why Middleware Matters

- **Cross-cutting Concerns**: Handle authentication, logging, validation globally
- **Reusability**: Same middleware can be used across different routes
- **Composability**: Combine multiple middleware for complex behavior
- **Separation**: Keep concerns like auth separate from business logic

Middleware lets you build request processing pipelines that are both powerful and maintainable.

## How Everything Works Together

These concepts combine to create a clean architecture:

```typescript
// 1. Middleware processes the request
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    // Authenticate request
    next();
  }
}

// 2. Service contains business logic
@Injectable()
export class UserService {
  createUser(userData) {
    // Business logic here
    return newUser;
  }
}

// 3. Controller coordinates HTTP and business layers
@Controller('/users', AuthMiddleware)
export class UserController {
  constructor(private userService: UserService) {} // DI

  @Post('/') // Decorator defines route
  createUser(@Body() userData: any) { // Decorator extracts data
    return this.userService.createUser(userData); // Delegate to service
  }
}
```

### The Request Flow

1. **Request arrives** at your API
2. **Middleware** processes it (auth, logging, etc.)
3. **Controller** receives the request via decorators
4. **Dependency injection** provides required services
5. **Service** performs the business operation
6. **Controller** returns the result
7. **Framework** serializes and sends the response

## Benefits of This Architecture

### Separation of Concerns
Each component has a clear, single responsibility:
- Controllers handle HTTP
- Services handle business logic
- Middleware handles cross-cutting concerns

### Testability
Components can be tested in isolation:
- Test services without HTTP
- Test controllers with mocked services
- Test middleware independently

### Maintainability
Changes are localized:
- Business logic changes don't affect controllers
- Route changes don't affect services
- New features can reuse existing services

### Scalability
The architecture supports growth:
- Add new controllers easily
- Share services across controllers
- Compose middleware for complex requirements

## When to Use What

### Use Controllers For:
- Defining API endpoints
- Extracting request data
- Setting response status codes
- Coordinating between services

### Use Services For:
- Business logic and rules
- Data processing
- External API calls
- Operations that might be reused

### Use Dependency Injection For:
- Connecting services to controllers
- Managing object lifecycles
- Making testing easier
- Keeping code loosely coupled

### Use Decorators For:
- Defining routes and HTTP methods
- Extracting request parameters
- Configuring middleware
- Adding metadata for documentation

### Use Middleware For:
- Authentication and authorization
- Request/response logging
- Input validation
- Rate limiting
- Error handling
