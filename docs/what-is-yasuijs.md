# What is YasuiJS?

YasuiJS is a modern, lightweight REST API framework built for TypeScript developers who want to create powerful APIs with minimal boilerplate code. It combines the simplicity of Express.js with the elegance of decorators and dependency injection.

## Core Philosophy

YasuiJS follows these core principles:

- **Decorator-First**: Use intuitive decorators to define your API structure
- **TypeScript Native**: Built from the ground up for TypeScript with full type safety
- **Zero Configuration**: Get started immediately with sensible defaults
- **Express.js Foundation**: Leverage the power and ecosystem of Express.js
- **Developer Experience**: Focus on code readability and maintainability

## Key Features

### 🎯 Decorator-Based Routing

Define your API endpoints using intuitive decorators:

```typescript
@Controller('/api/users')
export class UserController {
  
  @Get('/')
  getAllUsers() {
    return users;
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    return users.find(u => u.id === id);
  }

  @Post('/')
  createUser(@Body() user: CreateUserDto) {
    return createUser(user);
  }
}
```

### 🔧 Dependency Injection

Built-in dependency injection system for clean, testable code:

```typescript
@Injectable()
export class UserService {
  async getUsers() {
    // Database logic here
  }
}

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getUsers() {
    return this.userService.getUsers();
  }
}
```

### 📚 Auto-Generated Swagger Documentation

Generate beautiful API documentation automatically:

```typescript
@Get('/:id')
@ApiOperation('Get user by ID', 'Retrieves detailed user information')
@ApiResponse(200, 'Success', UserSchema)
@ApiResponse(404, 'User not found')
getUser(@Param('id') id: string) {
  return getUser(id);
}
```

### 🛡️ Middleware Support

Flexible middleware system for authentication, validation, and more:

```typescript
@Controller('/admin')
@Middleware([authMiddleware, adminMiddleware])
export class AdminController {
  
  @Get('/users')
  @Middleware([rateLimitMiddleware])
  getUsers() {
    // Only accessible by authenticated admins
  }
}
```

### 🔍 Parameter Extraction

Easy parameter binding with decorators:

```typescript
@Post('/search')
searchUsers(
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Body() filters: SearchFilters,
  @Header('authorization') token: string
) {
  // All parameters automatically extracted and typed
}
```

## Architecture Overview

YasuiJS is built on top of Express.js and provides a higher-level abstraction:

```
┌─────────────────┐
│   YasuiJS App   │
├─────────────────┤
│   Controllers   │
│   Services      │
│   Middleware    │
├─────────────────┤
│   Express.js    │
├─────────────────┤
│   HTTP Server   │
└─────────────────┘
```

### Core Components

1. **Controllers**: Define API endpoints using decorators
2. **Services**: Business logic with dependency injection
3. **Middleware**: Request/response processing
4. **Decorators**: Route, parameter, and metadata definitions
5. **Dependency Container**: Automatic service resolution

## Why Choose YasuiJS?

### vs. Plain Express.js
- **Less Boilerplate**: No need to manually register routes
- **Type Safety**: Full TypeScript support with parameter validation
- **Auto Documentation**: Generate Swagger docs automatically
- **Dependency Injection**: Built-in DI container

### vs. Other Frameworks
- **Lightweight**: Minimal overhead compared to full-stack frameworks
- **Express.js Ecosystem**: Use any Express.js middleware or plugin
- **Simple Learning Curve**: Familiar concepts for Express.js developers
- **Flexible**: No opinionated structure, adapt to your needs

## Getting Started

Ready to build your first YasuiJS API? Check out our [Getting Started guide](/en/getting-started) for a step-by-step tutorial.

```bash
npm install yasui
```

YasuiJS is designed to make API development enjoyable and efficient. Whether you're building a simple REST API or a complex microservice, YasuiJS provides the tools you need to write clean, maintainable code. 