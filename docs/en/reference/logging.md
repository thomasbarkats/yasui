# Logging Service

YasuiJS includes a built-in logging service with timing capabilities and color-coded output. It provides structured logging for your application with request-specific context and performance monitoring.

The logger can be injected into services and controllers via constructor injection, or accessed directly in method parameters using the `@Logger()` decorator.

```typescript
import { Injectable, LoggerService } from 'yasui';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  getUser(id: string) {
    this.logger.log('Fetching user', { userId: id });
    const user = this.findUser(id);
    this.logger.success('User found successfully');
    return user;
  }
}
```

## Using LoggerService

### Constructor Injection

Inject the logger service in your service or controller constructors:

```typescript
@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  createUser(userData: any) {
    this.logger.log('Creating new user');
    // Business logic here
    this.logger.success('User created successfully');
  }
}

@Controller('/users')
export class UserController {
  constructor(private readonly logger: LoggerService) {}

  @Get('/')
  getUsers() {
    this.logger.log('Fetching all users');
    return this.userService.getAllUsers();
  }
}
```

### Method-Level Access

- `@Logger()` - Get request-specific logger instance (no parameters)

Use the `@Logger()` decorator to get a dedicated logger instance that is automatically started at the beginning of the route. This is useful for tracking timing throughout the operation in debug mode. This works in both controller methods and middleware methods.

```typescript
import { LoggerService } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Logger() logger: LoggerService) {
    logger.log('Processing user list request');
    // Logger is already started, timing is automatic
    const users = this.fetchUsers();
    logger.success(`Found ${users.length} users`);
    return users;
  }
}

@Middleware()
export class RequestLoggerMiddleware {
  use(
    @Req() req: Request,
    @Logger() logger: LoggerService
  ) {
    logger.log('Incoming request', { method: req.method, path: req.path });
  }
}
```

## Logging Methods

The LoggerService provides several methods for different log levels:

```typescript
@Injectable()
export class ExampleService {
  constructor(private logger: LoggerService) {}

  demonstrateLogs() {
    // General information
    this.logger.log('Application started');
    // Debug information (detailed)
    this.logger.debug('Debug information', { details: 'extra data' });
    // Success messages
    this.logger.success('Operation completed successfully');
    // Warning messages
    this.logger.warn('Warning: deprecated method used');
    // Error messages
    this.logger.error('Error occurred', { error: 'details' });
  }
}
```

## Timing Functionality

The logger includes built-in timing capabilities for performance monitoring:

```typescript
@Injectable()
export class DataService {
  constructor(private logger: LoggerService) {}

  processData() {
    this.logger.start(); // Start timer
    
    const data = this.fetchData();
    const elapsed = this.logger.stop(); // Stop and get elapsed time
    this.logger.log(`Processing completed in ${elapsed}ms`);
    
    return data;
  }

  batchProcess(items: any[]) {
    this.logger.start();
    
    for (const item of items) {
      this.processItem(item);
      this.logger.reset(); // Reset timer for next item
    }
    
    // Get current elapsed time without stopping
    const currentTime = this.logger.getTime();
    this.logger.debug(`Current processing time: ${currentTime}ms`);
  }
}
```

## Debug Mode Integration

When debug mode is enabled in your YasuiJS configuration, the logger provides more verbose output:

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true // Enables detailed logging
});
```

In debug mode:
- All incoming requests are automatically logged
- Debug messages are displayed
- More detailed error information is shown
