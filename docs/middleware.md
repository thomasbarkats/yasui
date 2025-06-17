# Middleware

Middleware in YasuiJS allows you to execute code before and after route handlers. This guide covers how to create and use middleware effectively.

## What is Middleware?

Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application's request-response cycle. Middleware can:

- Execute any code
- Modify the request and response objects
- End the request-response cycle
- Call the next middleware function in the stack

## Types of Middleware

### 1. Global Middleware

Global middleware runs on every request to your application.

```typescript
import { Injectable } from 'yasui';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  }
}

// Register in configuration
const config = {
  controllers: [UserController],
  middlewares: [LoggingMiddleware]
};
```

### 2. Controller-Level Middleware

Middleware applied to all routes within a specific controller.

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

@Controller('/users', AuthMiddleware)
export class UserController {
  // All routes in this controller will use AuthMiddleware
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

### 3. Route-Level Middleware

Middleware applied to specific routes.

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/')
  @Use(RateLimitMiddleware)
  getUsers() {
    return this.userService.getUsers();
  }
  
  @Post('/')
  @Use(AuthMiddleware)
  @Use(ValidationMiddleware)
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
}
```

## Creating Custom Middleware

### Basic Middleware

```typescript
import { Injectable } from 'yasui';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class SimpleMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    // Add custom data to request
    req.customData = 'Hello from middleware';
    
    // Continue to next middleware or route handler
    next();
  }
}
```

### Middleware with Configuration

```typescript
@Injectable()
export class ConfigurableMiddleware {
  constructor(private options: { enabled: boolean; logLevel: string }) {}
  
  run(req: Request, res: Response, next: NextFunction) {
    if (!this.options.enabled) {
      return next();
    }
    
    if (this.options.logLevel === 'debug') {
      console.log('Request details:', {
        method: req.method,
        path: req.path,
        headers: req.headers
      });
    }
    
    next();
  }
}

// Usage
const config = {
  controllers: [UserController],
  middlewares: [
    new ConfigurableMiddleware({ enabled: true, logLevel: 'debug' })
  ]
};
```

### Async Middleware

```typescript
@Injectable()
export class AsyncMiddleware {
  async run(req: Request, res: Response, next: NextFunction) {
    try {
      // Perform async operation
      const result = await this.someAsyncOperation();
      req.asyncData = result;
      next();
    } catch (error) {
      next(error);
    }
  }
  
  private async someAsyncOperation() {
    // Simulate async work
    return new Promise(resolve => setTimeout(() => resolve('async result'), 100));
  }
}
```

## Common Middleware Patterns

### Authentication Middleware

```typescript
@Injectable()
export class AuthMiddleware {
  constructor(private jwtService: JwtService) {}
  
  run(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    try {
      const decoded = this.jwtService.verify(token);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  }
}
```

### Rate Limiting Middleware

```typescript
@Injectable()
export class RateLimitMiddleware {
  private requests = new Map<string, { count: number; resetTime: number }>();
  
  run(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 100;
    
    const userRequests = this.requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      this.requests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (userRequests.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' });
    }
    
    userRequests.count++;
    next();
  }
}
```

### Validation Middleware

```typescript
@Injectable()
export class ValidationMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    const { name, email } = req.body;
    
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'Name is required and must be a string' });
    }
    
    if (!email || !this.isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    
    next();
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

### Logging Middleware

```typescript
@Injectable()
export class LoggingMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    
    // Log request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    
    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
      const duration = Date.now() - start;
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
      originalEnd.call(this, chunk, encoding);
    };
    
    next();
  }
}
```

### CORS Middleware

```typescript
@Injectable()
export class CorsMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  }
}
```

## Error Handling Middleware

### Global Error Handler

```typescript
@Injectable()
export class ErrorHandlerMiddleware {
  run(error: Error, req: Request, res: Response, next: NextFunction) {
    console.error('Error:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.name === 'UnauthorizedError') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Default error
    res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Custom Error Classes

```typescript
export class ValidationError extends Error {
  status = 400;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

// Usage in middleware
@Injectable()
export class AuthMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization;
    if (!token) {
      throw new UnauthorizedError('No token provided');
    }
    next();
  }
}
```

## Middleware Order

The order of middleware execution is important:

1. **Global middleware** (from configuration)
2. **Controller middleware** (from @Controller decorator)
3. **Route middleware** (from @Use decorator)
4. **Route handler**

```typescript
// Global middleware runs first
const config = {
  middlewares: [LoggingMiddleware, CorsMiddleware]
};

// Controller middleware runs second
@Controller('/users', AuthMiddleware)
export class UserController {
  
  // Route middleware runs third
  @Get('/')
  @Use(RateLimitMiddleware)
  @Use(CacheMiddleware)
  getUsers() {
    // Route handler runs last
    return this.userService.getUsers();
  }
}
```

## Testing Middleware

### Unit Testing

```typescript
import { AuthMiddleware } from './auth.middleware';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: jest.Mock;
  
  beforeEach(() => {
    middleware = new AuthMiddleware();
    mockReq = {
      headers: {}
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });
  
  it('should call next() when valid token is provided', () => {
    mockReq.headers = { authorization: 'Bearer valid-token' };
    
    middleware.run(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
  });
  
  it('should return 401 when no token is provided', () => {
    middleware.run(mockReq as Request, mockRes as Response, mockNext);
    
    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
    expect(mockNext).not.toHaveBeenCalled();
  });
});
```

### Integration Testing

```typescript
describe('API with AuthMiddleware', () => {
  let app: Application;
  
  beforeAll(() => {
    const config = {
      controllers: [UserController],
      middlewares: [AuthMiddleware]
    };
    app = new Core(config).createApp();
  });
  
  it('should return 401 for protected routes without token', async () => {
    const response = await request(app)
      .get('/users')
      .expect(401);
    
    expect(response.body.error).toBe('No token provided');
  });
  
  it('should allow access with valid token', async () => {
    const response = await request(app)
      .get('/users')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);
  });
});
```

## Best Practices

### 1. Keep Middleware Focused

```typescript
// Good - single responsibility
@Injectable()
export class LoggingMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.path}`);
    next();
  }
}

// Avoid - multiple responsibilities
@Injectable()
export class ComplexMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    // Logging
    console.log(`${req.method} ${req.path}`);
    
    // Authentication
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Rate limiting
    // ... rate limiting logic
    
    // Validation
    // ... validation logic
    
    next();
  }
}
```

### 2. Use Dependency Injection

```typescript
// Good - use DI for dependencies
@Injectable()
export class AuthMiddleware {
  constructor(private jwtService: JwtService) {}
  
  run(req: Request, res: Response, next: NextFunction) {
    // Use injected service
    const decoded = this.jwtService.verify(token);
    next();
  }
}

// Avoid - create dependencies manually
@Injectable()
export class AuthMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    const jwtService = new JwtService(); // Don't do this
    const decoded = jwtService.verify(token);
    next();
  }
}
```

### 3. Handle Errors Properly

```typescript
// Good - proper error handling
@Injectable()
export class AuthMiddleware {
  run(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({ error: 'No token provided' });
      }
      
      const decoded = this.jwtService.verify(token);
      req.user = decoded;
      next();
    } catch (error) {
      next(error); // Pass error to error handler
    }
  }
}
```

### 4. Use TypeScript Types

```typescript
// Good - with proper types
@Injectable()
export class AuthMiddleware {
  run(req: Request, res: Response, next: NextFunction): void {
    // TypeScript will catch type errors
    const token: string | undefined = req.headers.authorization;
    next();
  }
}
```

## Next Steps

Now that you understand middleware, you can:

- [Learn about Configuration](/guide/configuration)
- [Master Error Handling](/guide/error-handling)
- [Explore Advanced Patterns](/guide/advanced-patterns)
- [Build Production APIs](/guide/production) 