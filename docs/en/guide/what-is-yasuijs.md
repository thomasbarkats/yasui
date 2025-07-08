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
  const users = getUsersList(page);
  res.json(users);
});

app.get('/api/users/:id', (req, res) => {
  const id = req.params.id;
  const user = getUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});
```

This functional approach has several limitations:
- Manual parameter extraction and validation
- Repetitive error handling
- Difficult to test due to tight coupling
- No automatic documentation generation
- Hard to organize and scale as applications grow

### The YasuiJS Approach

YasuiJS adopts a class-based, object-oriented approach with decorators:

```typescript
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers(@Query('page') page: number = 1) {
    return this.userService.getUsers(page);
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
}
```

While this might seem more verbose at first glance, the class-based approach brings significant architectural advantages.

## Core Philosophy

YasuiJS is built around these fundamental principles:

### Object-Oriented Architecture
Classes and decorators provide better organization, encapsulation, and maintainability. This approach naturally supports established architectural patterns like onion architecture, hexagonal architecture, and clean architecture.

### Dependency Injection
Built-in dependency injection enables loose coupling, better testability, and cleaner separation of concerns. Dependencies are explicitly declared and automatically resolved.

### Declarative Over Imperative
Instead of manually registering routes and extracting parameters, you declare what you want using decorators. The framework handles the implementation details.

### TypeScript First
Every feature is designed with TypeScript in mind, providing full type safety and excellent IDE support.

### Minimal Dependencies
Keep things lightweight with minimal external dependencies, focusing on essentials.

## Architectural Benefits

### Better Code Organization
The class-based approach naturally organizes related functionality together. Controllers group related endpoints, services encapsulate business logic, and dependencies are clearly defined.

### Testability
Dependency injection makes unit testing straightforward. You can easily mock dependencies and test components in isolation.

### Scalability
As applications grow, the structured approach helps maintain code quality. Clear separation between controllers, services, and data layers prevents spaghetti code.

### Adaptability to Classic Patterns
YasuiJS naturally supports established architectural patterns:
- **Onion Architecture**: Clear separation between domain, application, and infrastructure layers
- **Hexagonal Architecture**: Ports and adapters pattern with dependency inversion
- **Clean Architecture**: Independence of frameworks, databases, and external agencies

### Maintainability
Clear boundaries between components, explicit dependencies, and declarative routing make the codebase easier to understand and modify.

## When to Choose YasuiJS

YasuiJS is perfect when you need:

- **Structured Architecture**: Building applications that will grow and need clear organization
- **Team Development**: Multiple developers working on the same codebase
- **Enterprise Applications**: Applications requiring maintainability and testability
- **Domain-Driven Design**: Applications with complex business logic
- **Microservices**: Services that need to be independently deployable and testable

## Express.js Foundation

YasuiJS is built on top of Express.js, so you get:
- All the performance and ecosystem benefits of Express.js
- Compatibility with existing Express.js middleware
- Gradual migration path from existing Express.js applications
- Familiar concepts for Express.js developers

YasuiJS doesn't replace Express.js—it enhances it with modern architectural patterns while maintaining all the benefits of the Express.js ecosystem.
