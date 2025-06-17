# What is YasuiJS?

YasuiJS is a modern, lightweight REST API framework designed specifically for TypeScript developers. It takes the simplicity of Express.js and enhances it with powerful decorators and dependency injection, making API development more intuitive and maintainable.

## Why YasuiJS?

Building REST APIs can be repetitive and error-prone. Traditional Express.js applications require lots of boilerplate code for route registration, parameter extraction, and dependency management. YasuiJS eliminates this complexity by providing a declarative approach to API development.

### The Problem with Traditional Approaches

When building APIs with plain Express.js, you often end up with code like this:

```typescript
// Traditional Express.js approach
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const users = userService.getUsers(page, limit);
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const userData = req.body;
  const newUser = userService.createUser(userData);
  res.status(201).json(newUser);
});
```

This approach has several issues:
- Manual parameter extraction and validation
- Repetitive error handling
- Difficult to test due to tight coupling
- No automatic documentation generation

### The YasuiJS Solution

With YasuiJS, the same functionality becomes much cleaner:

```typescript
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.userService.getUsers(page, limit);
  }

  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
}
```

## Core Philosophy

YasuiJS is built around these fundamental principles:

### Declarative Over Imperative
Instead of manually registering routes and extracting parameters, you declare what you want using decorators. The framework handles the rest.

### TypeScript First
Every feature is designed with TypeScript in mind, providing full type safety and excellent IDE support.

### Zero Configuration
Get started immediately with sensible defaults. Advanced configuration is available when you need it.

### Express.js Foundation
Built on top of Express.js, so you can use any Express.js middleware or plugin in your YasuiJS application.

## Key Features

### Decorator-Based Routing

Define your API endpoints using intuitive decorators that clearly express your intent:

```typescript
@Controller('/api/users')
export class UserController {
  
  @Get('/')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('/')
  createUser(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }

  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.userService.updateUser(id, user);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
```

### Dependency Injection

Automatically inject services and dependencies into your controllers:

```typescript
@Injectable()
export class UserService {
  async getUsers() {
    // Database logic here
    return await this.database.find('users');
  }
}

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getUsers() {
    return await this.userService.getUsers();
  }
}
```

The framework automatically creates instances of your services and injects them where needed. This makes your code more testable and maintainable.

### Automatic Documentation

Generate beautiful API documentation without writing a single line of documentation code:

```typescript
@Get('/:id')
@ApiOperation('Get user by ID', 'Retrieves detailed user information by their unique identifier')
@ApiResponse(200, 'Success', UserSchema)
@ApiResponse(404, 'User not found')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(id);
}
```

### Flexible Middleware

Apply middleware at different levels with ease:

```typescript
@Controller('/admin')
@Middleware([authMiddleware, adminMiddleware])
export class AdminController {
  
  @Get('/users')
  @Middleware([rateLimitMiddleware])
  getUsers() {
    // This route requires authentication, admin privileges, and rate limiting
  }
}
```

### Parameter Extraction

Extract and validate request data automatically:

```typescript
@Post('/search')
searchUsers(
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Body() filters: SearchFilters,
  @Header('authorization') token: string
) {
  // All parameters are automatically extracted, typed, and validated
  return this.userService.searchUsers(page, limit, filters, token);
}
```

## Architecture Overview

YasuiJS sits on top of Express.js, providing a higher-level abstraction:

```
┌─────────────────┐
│   YasuiJS App   │  ← Your application code
├─────────────────┤
│   Controllers   │  ← Route handlers with decorators
│   Services      │  ← Business logic with DI
│   Middleware    │  ← Request processing
├─────────────────┤
│   Express.js    │  ← HTTP server and routing
├─────────────────┤
│   HTTP Server   │  ← Network layer
└─────────────────┘
```

### How It Works

1. **Application Startup**: YasuiJS scans your controllers and services
2. **Route Registration**: Automatically registers routes based on decorators
3. **Dependency Resolution**: Creates and injects service instances
4. **Request Processing**: Handles incoming requests through the middleware chain
5. **Response Generation**: Automatically serializes and sends responses

## When to Use YasuiJS

YasuiJS is perfect for:

- **REST APIs**: Building clean, well-documented REST endpoints
- **Microservices**: Lightweight services with minimal overhead
- **TypeScript Projects**: Full type safety and modern ES6+ features
- **Express.js Migration**: Gradual migration from existing Express.js apps
- **Rapid Prototyping**: Get APIs running quickly with minimal setup

## Getting Started

Ready to build your first YasuiJS API? The [Getting Started guide](/getting-started) will walk you through creating a complete API in just a few minutes.

```bash
npm install yasui
```

YasuiJS is designed to make API development enjoyable and efficient. Whether you're building a simple REST API or a complex microservice, YasuiJS provides the tools you need to write clean, maintainable code. 