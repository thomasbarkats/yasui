# Error Handling

YasuiJS provides built-in error handling capabilities that make it easy to manage errors consistently across your application. This guide covers error handling patterns, custom error classes, and best practices.

## Built-in Error Handling

YasuiJS automatically catches and processes errors thrown in your route handlers, middleware, and services.

### Automatic Error Processing

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.getUserById(parseInt(id));
    if (!user) {
      throw new Error('User not found'); // This will be caught automatically
    }
    return user;
  }
}
```

### Default Error Response

When an error is thrown, YasuiJS automatically returns a JSON response with:

- **Status Code**: 500 (Internal Server Error) by default
- **Error Message**: The error message
- **Error Details**: Additional information in debug mode

```json
{
  "error": "User not found",
  "status": 500,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Custom Error Classes

### Creating Custom Errors

Create custom error classes that extend the base `Error` class and include a `status` property.

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
  
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends Error {
  status = 401;
  
  constructor(message: string = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends Error {
  status = 403;
  
  constructor(message: string = 'Forbidden') {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends Error {
  status = 409;
  
  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
```

### Using Custom Errors

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.getUserById(parseInt(id));
    if (!user) {
      throw new NotFoundError('User');
    }
    return user;
  }
  
  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    if (!userData.name || !userData.email) {
      throw new ValidationError('Name and email are required');
    }
    
    const existingUser = this.userService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }
    
    return this.userService.createUser(userData);
  }
  
  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    const user = this.userService.getUserById(parseInt(id));
    if (!user) {
      throw new NotFoundError('User');
    }
    
    if (userData.email && userData.email !== user.email) {
      const existingUser = this.userService.getUserByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('Email already in use');
      }
    }
    
    return this.userService.updateUser(parseInt(id), userData);
  }
}
```

## Error Handling in Services

### Service-Level Error Handling

```typescript
@Injectable()
export class UserService {
  
  async getUserById(id: number): Promise<User> {
    try {
      const user = await this.database.query('SELECT * FROM users WHERE id = ?', [id]);
      
      if (!user) {
        throw new NotFoundError('User');
      }
      
      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error; // Re-throw custom errors
      }
      
      // Log unexpected errors
      this.logger.error('Database error while fetching user', error);
      throw new Error('Failed to fetch user');
    }
  }
  
  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Validate input
      if (!userData.name || !userData.email) {
        throw new ValidationError('Name and email are required');
      }
      
      if (!this.isValidEmail(userData.email)) {
        throw new ValidationError('Invalid email format');
      }
      
      // Check for existing user
      const existingUser = await this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }
      
      // Create user
      const user = await this.database.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        [userData.name, userData.email]
      );
      
      return user;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      
      this.logger.error('Database error while creating user', error);
      throw new Error('Failed to create user');
    }
  }
  
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
```

## Middleware Error Handling

### Error Handling Middleware

```typescript
@Injectable()
export class ErrorHandlerMiddleware {
  run(error: Error, req: Request, res: Response, next: NextFunction) {
    // Log the error
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString()
    });
    
    // Handle custom errors
    if (error instanceof ValidationError) {
      return res.status(400).json({
        error: error.message,
        status: 400,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error instanceof NotFoundError) {
      return res.status(404).json({
        error: error.message,
        status: 404,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error instanceof UnauthorizedError) {
      return res.status(401).json({
        error: error.message,
        status: 401,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error instanceof ForbiddenError) {
      return res.status(403).json({
        error: error.message,
        status: 403,
        timestamp: new Date().toISOString()
      });
    }
    
    if (error instanceof ConflictError) {
      return res.status(409).json({
        error: error.message,
        status: 409,
        timestamp: new Date().toISOString()
      });
    }
    
    // Handle unknown errors
    const status = (error as any).status || 500;
    const message = status === 500 ? 'Internal server error' : error.message;
    
    res.status(status).json({
      error: message,
      status,
      timestamp: new Date().toISOString()
    });
  }
}
```

### Authentication Error Handling

```typescript
@Injectable()
export class AuthMiddleware {
  constructor(private jwtService: JwtService) {}
  
  run(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        throw new UnauthorizedError('No token provided');
      }
      
      const decoded = this.jwtService.verify(token);
      req.user = decoded;
      next();
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      
      // JWT verification failed
      throw new UnauthorizedError('Invalid token');
    }
  }
}
```

## Async Error Handling

### Async/Await Error Handling

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    try {
      const user = await this.userService.getUserById(parseInt(id));
      return user;
    } catch (error) {
      // Re-throw custom errors
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      // Log unexpected errors
      this.logger.error('Unexpected error in getUser', error);
      throw new Error('Failed to fetch user');
    }
  }
  
  @Post('/')
  async createUser(@Body() userData: CreateUserDto) {
    try {
      const user = await this.userService.createUser(userData);
      return user;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        throw error;
      }
      
      this.logger.error('Unexpected error in createUser', error);
      throw new Error('Failed to create user');
    }
  }
}
```

### Promise Error Handling

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers()
      .catch(error => {
        this.logger.error('Failed to fetch users', error);
        throw new Error('Failed to fetch users');
      });
  }
}
```

## Error Logging

### Structured Error Logging

```typescript
@Injectable()
export class LoggerService {
  error(message: string, error: Error, context?: any) {
    const logEntry = {
      level: 'ERROR',
      message,
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context,
      timestamp: new Date().toISOString(),
      requestId: context?.requestId
    };
    
    console.error(JSON.stringify(logEntry, null, 2));
  }
}

// Usage in controllers
@Controller('/users')
export class UserController {
  constructor(private logger: LoggerService) {}
  
  @Get('/:id')
  async getUser(@Param('id') id: string) {
    try {
      return await this.userService.getUserById(parseInt(id));
    } catch (error) {
      this.logger.error('Failed to fetch user', error, { userId: id });
      throw error;
    }
  }
}
```

## Error Response Formatting

### Consistent Error Responses

```typescript
interface ErrorResponse {
  error: string;
  status: number;
  timestamp: string;
  path?: string;
  method?: string;
  details?: any;
}

@Injectable()
export class ErrorFormatter {
  format(error: Error, req?: Request): ErrorResponse {
    const response: ErrorResponse = {
      error: error.message,
      status: (error as any).status || 500,
      timestamp: new Date().toISOString()
    };
    
    if (req) {
      response.path = req.path;
      response.method = req.method;
    }
    
    // Add additional details for validation errors
    if (error instanceof ValidationError) {
      response.details = (error as any).details;
    }
    
    return response;
  }
}
```

## Error Handling Best Practices

### 1. Use Specific Error Types

```typescript
// Good - specific error types
if (!user) {
  throw new NotFoundError('User');
}

if (!userData.email) {
  throw new ValidationError('Email is required');
}

if (!token) {
  throw new UnauthorizedError('No token provided');
}

// Avoid - generic errors
if (!user) {
  throw new Error('User not found');
}
```

### 2. Don't Expose Internal Errors

```typescript
// Good - sanitize error messages
try {
  await this.database.query('SELECT * FROM users');
} catch (error) {
  this.logger.error('Database error', error);
  throw new Error('Failed to fetch users'); // Generic message for client
}

// Avoid - exposing internal details
try {
  await this.database.query('SELECT * FROM users');
} catch (error) {
  throw new Error(`Database connection failed: ${error.message}`);
}
```

### 3. Log Errors Appropriately

```typescript
// Good - structured logging
try {
  await this.userService.createUser(userData);
} catch (error) {
  this.logger.error('Failed to create user', error, {
    userData: { name: userData.name, email: userData.email },
    timestamp: new Date().toISOString()
  });
  throw error;
}

// Avoid - console.log for errors
try {
  await this.userService.createUser(userData);
} catch (error) {
  console.log('Error:', error);
  throw error;
}
```

### 4. Handle Async Errors Properly

```typescript
// Good - proper async error handling
@Get('/users')
async getUsers() {
  try {
    return await this.userService.getUsers();
  } catch (error) {
    this.logger.error('Failed to fetch users', error);
    throw new Error('Failed to fetch users');
  }
}

// Avoid - unhandled promise rejections
@Get('/users')
getUsers() {
  return this.userService.getUsers(); // No error handling
}
```

### 5. Use Error Boundaries

```typescript
// Good - error boundaries in services
@Injectable()
export class UserService {
  async getUserById(id: number): Promise<User> {
    try {
      return await this.database.getUser(id);
    } catch (error) {
      this.logger.error('Database error in getUserById', error, { userId: id });
      throw new NotFoundError('User');
    }
  }
}
```

## Testing Error Handling

### Unit Testing Errors

```typescript
describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;
  
  beforeEach(() => {
    mockUserService = {
      getUserById: jest.fn(),
      createUser: jest.fn()
    } as any;
    
    controller = new UserController(mockUserService);
  });
  
  it('should throw NotFoundError when user not found', async () => {
    mockUserService.getUserById.mockResolvedValue(null);
    
    await expect(controller.getUser('123')).rejects.toThrow(NotFoundError);
  });
  
  it('should throw ValidationError for invalid input', async () => {
    const invalidUserData = { name: '', email: 'invalid-email' };
    
    await expect(controller.createUser(invalidUserData)).rejects.toThrow(ValidationError);
  });
});
```

### Integration Testing Errors

```typescript
describe('User API Error Handling', () => {
  let app: Application;
  
  beforeAll(() => {
    const config = {
      controllers: [UserController],
      middlewares: [ErrorHandlerMiddleware]
    };
    app = new Core(config).createApp();
  });
  
  it('should return 404 for non-existent user', async () => {
    const response = await request(app)
      .get('/users/999')
      .expect(404);
    
    expect(response.body.error).toBe('User not found');
    expect(response.body.status).toBe(404);
  });
  
  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/users')
      .send({ name: '', email: 'invalid' })
      .expect(400);
    
    expect(response.body.error).toContain('required');
    expect(response.body.status).toBe(400);
  });
});
```

## Next Steps

Now that you understand error handling, you can:

- [Explore Advanced Patterns](/guide/advanced-patterns)
- [Master Production Deployment](/guide/production)
- [Build Scalable APIs](/guide/scaling)
- [Learn Testing Strategies](/guide/testing) 