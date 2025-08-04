# Dependency Injection

YasuiJS provides a complete dependency injection system with automatic resolution of dependencies and scope management. It enables loose coupling, better testability, and cleaner separation of concerns.

## Overview

Dependency injection automatically manages relationships between components. Instead of manually creating and connecting objects, YasuiJS does it for you by analyzing class constructors and method parameters.

```typescript
import { Injectable, Controller } from 'yasui';

@Injectable()
export class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

@Controller('/users')
export class UserController {
  // UserService is automatically created and injected
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

## Injectable Services

### Injectable Decorator

- `@Injectable()` - Mark a class as injectable (no parameters, required for all services)

Use the `@Injectable()` decorator to mark a class as injectable. This decorator is **required** for all services that will be injected.

```typescript
import { Injectable } from 'yasui';

@Injectable()
export class UserService {
  getUser(id: string) {
    // Business logic here
    return { id, name: 'John Doe' };
  }
}

@Injectable()
export class EmailService {
  sendEmail(to: string, subject: string) {
    // Email logic here
    console.log(`Sending email to ${to}: ${subject}`);
  }
}
```

## Constructor Injection

Simply declare your dependencies in controller, middleware, or service constructors. You can inject multiple services in the same constructor. They will be automatically resolved and injected:

```typescript
@Injectable()
export class OrderService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private paymentService: PaymentService
  ) {}

  processOrder(orderData: any) {
    const user = this.userService.getUser(orderData.userId);
    const payment = this.paymentService.processPayment(orderData.amount);
    this.emailService.sendEmail(user.email, 'Order confirmed');
    
    return { order: orderData, payment };
  }
}
```

## Dependency Scopes

### Scope Decorator

- `@Scope(scope)` - Specify dependency scope (required scope parameter)

YasuiJS supports three different dependency scopes that control how instances are created and shared:

- **`Scopes.SHARED`** (default): Singleton instance shared across the application
- **`Scopes.LOCAL`**: New instance for each injection context
- **`Scopes.DEEP_LOCAL`**: New instance that propagates locality to its own dependencies

The `@Scope()` decorator is applied at the injection point, not on the service class itself.

### Constructor-level Scopes

You can specify scopes for individual dependencies in constructors:

```typescript
@Injectable()
export class MyService {
  constructor(
    @Scope(Scopes.LOCAL) private tempService: TempService,
    @Scope(Scopes.DEEP_LOCAL) private isolatedService: IsolatedService,
    private sharedService: SharedService // SHARED by default
  ) {}
}
```

### Scope Selection Guidelines

- **SHARED**: Use for stateless services, caches, database connections
- **LOCAL**: Use for request-specific services, temporary processors
- **DEEP_LOCAL**: Use for completely isolated operations, testing scenarios

## Method-level Injection

### Inject Decorator

- `@Inject(token?)` - Inject dependencies into method parameters (optional custom token)

You can inject dependencies directly into controller or middleware method parameters. This restricts the injection to specific endpoints instead of the entire controller, allowing for fine-grained scope management. For example, you can have a shared service injected in the constructor, but a specific route that needs a dedicated instance of the same service.

```typescript
@Controller('/users')
export class UserController {

  // Shared instance for the controller
  constructor(private userService: UserService) {}

  @Get('/:id')
  getUser(
    @Param('id') id: string,
    @Inject() userService: UserService // Specific instance to this endpoint
  ) {
    return userService.getUser(id);
  }
}
```

### Method-level Scopes

Scopes also work with method-level injection:

```typescript
@Controller('/api')
export class ApiController {
  @Get('/data')
  getData(
    @Inject() @Scope(Scopes.LOCAL) tempService: TempService,
    @Inject() @Scope(Scopes.SHARED) cacheService: CacheService
  ) {
    return tempService.processData(cacheService.getData());
  }
}
```

## Custom Injection Tokens

### Using Custom Tokens

For complex scenarios, use custom injection tokens with `@Inject()`. This is useful for injecting primitive values, configurations, or when you need multiple instances of the same class:

```typescript
@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_URL') private dbUrl: string,
    @Inject('CONFIG') private config: AppConfig
  ) {
    console.log(`Connecting to: ${this.dbUrl}`);
  }
}

@Controller('/users')
export class UserController {
  @Get('/')
  getUsers(
    @Inject('API_VERSION') apiVersion: string,
    @Inject() userService: UserService
  ) {
    return {
      version: apiVersion,
      users: userService.getAllUsers()
    };
  }
}
```

### Registering Custom Tokens

Register custom tokens in your app configuration:

```typescript
interface AppConfig {
  apiKey: string;
  timeout: number;
}

yasui.createServer({
  controllers: [UserController],
  injections: [
    { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
    { token: 'API_VERSION', provide: 'v1.0.0' },
    { 
      token: 'CONFIG', 
      provide: { 
        apiKey: process.env.API_KEY, 
        timeout: 5000 
      } as AppConfig
    }
  ]
});
```

### Circular Dependencies

YasuiJS automatically detects and prevents circular dependencies at startup:

```typescript
// This will be detected and reported as an error
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // Circular dependency!
}
```
