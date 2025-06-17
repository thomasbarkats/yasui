# Dependency Injection

YasuiJS includes a powerful built-in dependency injection system that makes your code more modular, testable, and maintainable. This guide covers everything you need to know about using dependency injection effectively.

## What is Dependency Injection?

Dependency Injection (DI) is a design pattern where dependencies are provided to a class rather than the class creating them itself. This promotes loose coupling and makes your code easier to test and maintain.

## Basic Dependency Injection

### @Injectable Decorator

The `@Injectable()` decorator marks a class as injectable, allowing it to be used in the DI container.

```typescript
import { Injectable } from 'yasui';

@Injectable()
export class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}
```

### Constructor Injection

Inject dependencies through the constructor:

```typescript
import { Controller, Get } from 'yasui';
import { UserService } from '../services/user.service';

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

## Injection Scopes

YasuiJS supports different injection scopes to control the lifecycle of injected dependencies.

### Singleton Scope (Default)

A single instance is created and reused throughout the application lifecycle.

```typescript
@Injectable()
export class ConfigService {
  private config = { apiKey: 'secret' };
  
  getApiKey() {
    return this.config.apiKey;
  }
}
```

### Request Scope

A new instance is created for each HTTP request.

```typescript
import { Injectable, Scope, Scopes } from 'yasui';

@Injectable()
export class RequestLogger {
  private requestId = Math.random().toString(36).substr(2, 9);
  
  log(message: string) {
    console.log(`[${this.requestId}] ${message}`);
  }
}

@Controller('/users')
export class UserController {
  constructor(
    @Scope(Scopes.REQUEST) private logger: RequestLogger
  ) {}
  
  @Get('/')
  getUsers() {
    this.logger.log('Fetching users');
    return [{ id: 1, name: 'John' }];
  }
}
```

## Custom Injection Tokens

Use custom tokens to inject dependencies that aren't classes or to provide multiple implementations.

### String Tokens

```typescript
// Register a custom token
const config = {
  controllers: [UserController],
  injections: [
    {
      token: 'DATABASE_URL',
      provide: 'postgresql://localhost:5432/mydb'
    },
    {
      token: 'API_KEY',
      provide: process.env.API_KEY
    }
  ]
};

// Inject using the token
@Controller('/users')
export class UserController {
  constructor(
    @Inject('DATABASE_URL') private dbUrl: string,
    @Inject('API_KEY') private apiKey: string
  ) {}
}
```

### Interface Tokens

```typescript
// Define an interface
interface ILogger {
  log(message: string): void;
}

// Implement the interface
@Injectable()
export class ConsoleLogger implements ILogger {
  log(message: string) {
    console.log(message);
  }
}

// Register the implementation
const config = {
  controllers: [UserController],
  injections: [
    {
      token: 'ILogger',
      provide: ConsoleLogger
    }
  ]
};

// Inject the interface
@Controller('/users')
export class UserController {
  constructor(
    @Inject('ILogger') private logger: ILogger
  ) {}
  
  @Get('/')
  getUsers() {
    this.logger.log('Fetching users');
    return [{ id: 1, name: 'John' }];
  }
}
```

## Method Parameter Injection

Inject dependencies directly into method parameters using the `@Inject()` decorator.

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/')
  getUsers(@Inject() userService: UserService) {
    return userService.getUsers();
  }
  
  @Post('/')
  createUser(
    @Body() userData: CreateUserDto,
    @Inject() userService: UserService,
    @Inject('ILogger') logger: ILogger
  ) {
    logger.log('Creating new user');
    return userService.createUser(userData);
  }
}
```

## Circular Dependencies

YasuiJS can handle circular dependencies automatically, but it's generally better to avoid them by restructuring your code.

### Avoiding Circular Dependencies

```typescript
// Instead of this (circular dependency)
@Injectable()
export class UserService {
  constructor(private emailService: EmailService) {}
}

@Injectable()
export class EmailService {
  constructor(private userService: UserService) {}
}

// Use this (no circular dependency)
@Injectable()
export class UserService {
  constructor(private emailService: EmailService) {}
}

@Injectable()
export class EmailService {
  // EmailService doesn't need UserService
}
```

### Using Events or Callbacks

```typescript
@Injectable()
export class UserService {
  private emailCallbacks: ((user: User) => void)[] = [];
  
  onUserCreated(callback: (user: User) => void) {
    this.emailCallbacks.push(callback);
  }
  
  createUser(userData: CreateUserDto) {
    const user = { id: 1, ...userData };
    this.emailCallbacks.forEach(callback => callback(user));
    return user;
  }
}

@Injectable()
export class EmailService {
  constructor(private userService: UserService) {
    this.userService.onUserCreated(user => {
      this.sendWelcomeEmail(user);
    });
  }
  
  sendWelcomeEmail(user: User) {
    console.log(`Sending welcome email to ${user.email}`);
  }
}
```

## Factory Functions

Use factory functions to create complex dependencies or dependencies that require configuration.

```typescript
// Factory function
function createDatabase(config: DatabaseConfig) {
  return new Database(config);
}

// Register the factory
const config = {
  controllers: [UserController],
  injections: [
    {
      token: 'DATABASE',
      provide: () => createDatabase({
        host: 'localhost',
        port: 5432,
        database: 'mydb'
      })
    }
  ]
};

// Inject the factory result
@Controller('/users')
export class UserController {
  constructor(
    @Inject('DATABASE') private db: Database
  ) {}
}
```

## Testing with Dependency Injection

DI makes your code much easier to test by allowing you to inject mock dependencies.

### Unit Testing

```typescript
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;
  
  beforeEach(() => {
    mockUserService = {
      getUsers: jest.fn(),
      getUserById: jest.fn(),
      createUser: jest.fn()
    } as any;
    
    controller = new UserController(mockUserService);
  });
  
  it('should return users', () => {
    const mockUsers = [{ id: 1, name: 'John' }];
    mockUserService.getUsers.mockReturnValue(mockUsers);
    
    const result = controller.getUsers();
    
    expect(result).toEqual(mockUsers);
    expect(mockUserService.getUsers).toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
import { Core } from 'yasui';
import { UserController } from './user.controller';
import { MockUserService } from './mock-user.service';

describe('User API Integration', () => {
  let app: Application;
  
  beforeAll(() => {
    const config = {
      controllers: [UserController],
      injections: [
        {
          token: UserService,
          provide: MockUserService
        }
      ]
    };
    
    app = new Core(config).createApp();
  });
  
  it('should get users', async () => {
    const response = await request(app)
      .get('/users')
      .expect(200);
    
    expect(response.body).toEqual([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ]);
  });
});
```

## Best Practices

### 1. Keep Dependencies Minimal

```typescript
// Good - minimal dependencies
@Injectable()
export class UserService {
  constructor(
    private db: Database,
    private logger: Logger
  ) {}
}

// Avoid - too many dependencies
@Injectable()
export class UserService {
  constructor(
    private db: Database,
    private logger: Logger,
    private emailService: EmailService,
    private cacheService: CacheService,
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService
  ) {}
}
```

### 2. Use Interfaces for Dependencies

```typescript
// Define interfaces
interface IUserRepository {
  findById(id: number): Promise<User | null>;
  save(user: User): Promise<User>;
}

interface ILogger {
  log(message: string): void;
}

// Implement interfaces
@Injectable()
export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    // Implementation
  }
  
  async save(user: User): Promise<User> {
    // Implementation
  }
}

// Inject interfaces
@Injectable()
export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private logger: ILogger
  ) {}
}
```

### 3. Use Constructor Injection

```typescript
// Good - constructor injection
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}

// Avoid - property injection or manual instantiation
@Controller('/users')
export class UserController {
  private userService = new UserService();
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

### 4. Group Related Dependencies

```typescript
// Good - group related dependencies
@Injectable()
export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private emailService: IEmailService,
    private logger: ILogger
  ) {}
}

// Avoid - mixing unrelated dependencies
@Injectable()
export class UserService {
  constructor(
    private userRepo: IUserRepository,
    private paymentService: IPaymentService,
    private weatherService: IWeatherService
  ) {}
}
```

### 5. Use Meaningful Token Names

```typescript
// Good - descriptive token names
@Inject('DATABASE_CONNECTION')
@Inject('API_CONFIGURATION')
@Inject('LOGGER_SERVICE')

// Avoid - generic token names
@Inject('DB')
@Inject('CONFIG')
@Inject('LOG')
```

## Advanced Patterns

### Conditional Injection

```typescript
@Injectable()
export class UserService {
  constructor(
    @Inject(process.env.NODE_ENV === 'production' ? 'ProdLogger' : 'DevLogger')
    private logger: ILogger
  ) {}
}
```

### Lazy Loading

```typescript
@Injectable()
export class UserService {
  private heavyService: HeavyService | null = null;
  
  private getHeavyService(): HeavyService {
    if (!this.heavyService) {
      this.heavyService = new HeavyService();
    }
    return this.heavyService;
  }
  
  async processUser(userId: number) {
    const heavyService = this.getHeavyService();
    return heavyService.process(userId);
  }
}
```

### Service Locator Pattern

```typescript
@Injectable()
export class ServiceLocator {
  private services = new Map<string, any>();
  
  register<T>(token: string, service: T) {
    this.services.set(token, service);
  }
  
  get<T>(token: string): T {
    const service = this.services.get(token);
    if (!service) {
      throw new Error(`Service ${token} not found`);
    }
    return service;
  }
}
```

## Next Steps

Now that you understand dependency injection, you can:

- [Learn about Middleware](/guide/middleware)
- [Explore Configuration options](/guide/configuration)
- [Master Error Handling](/guide/error-handling)
- [Build Advanced APIs](/guide/advanced-patterns) 