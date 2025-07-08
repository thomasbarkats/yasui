# Error Handling

YasuiJS provides automatic error handling and formatting for both logging and client responses. All controller methods are automatically wrapped with error handling to catch and process any thrown errors.

## Overview

When an error occurs in your application, YasuiJS automatically:
- Logs the error with detailed information (URL, method, status, message)
- Formats and sends it to the client as a JSON response
- Includes HTTP status code, error details, request information, and any additional error data

```typescript
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.findById(id);
    
    if (!user) {
      // This error will be automatically caught and formatted
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    return user;
  }
}
```

## Custom Error Handling

### HttpError Class

Create custom errors with specific status codes and additional data by extending or using the `HttpError` class. Your custom error must set `status` and `message` properties and can include any additional properties.

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/users')
export class UserController {
 @Get('/:id')
 getUser(@Param('id') id: string) {
   const user = this.userService.findById(id);
   
   if (!user) {
     throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
   }
   
   return user;
 }
}
```

### Custom Error Classes

Create custom error classes for specific business logic errors:

```typescript
class ValidationError extends HttpError {
  fields: string[];

  constructor(message: string, fields: string[]) {
    super(HttpCode.BAD_REQUEST, message);
    this.fields = fields;
  }
}

@Controller('/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    const missingFields = this.validateUserData(userData);
    
    if (missingFields.length > 0) {
      throw new ValidationError('Missing required fields', missingFields);
    }
    
    return this.userService.createUser(userData);
  }
}
```

## HttpCode Enum

YasuiJS provides an `HttpCode` enum with common HTTP status codes. For a complete list of HTTP status codes and their meanings, see the [HTTP response status codes documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

```typescript
import { HttpCode } from 'yasui';

@Controller('/api')
export class ApiController {
  @Delete('/:id')
  deleteItem(@Param('id') id: string) {
    if (!this.service.exists(id)) {
      throw new HttpError(HttpCode.NOT_FOUND, 'Item not found');
    }
    
    this.service.delete(id);
  }
}
```

## Error Response Format

When an error is thrown, YasuiJS automatically formats it into a consistent JSON response:

```json
{
  "error": {
    "status": 404,
    "message": "User not found",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/users/123",
    "method": "GET",
    "data": {
      "resourceType": "User",
      "resourceId": "123"
    }
  }
}
```

The response includes:
- **status**: HTTP status code
- **message**: Error message
- **timestamp**: When the error occurred
- **path**: Request path where the error happened
- **method**: HTTP method
- **data**: Any additional properties from your custom error

## Error Handling in Services

Services can throw errors that will be automatically caught when called from controllers:

```typescript
@Injectable()
export class UserService {
  findById(id: string) {
    const user = this.database.findUser(id);
    
    if (!user) {
      // This will be caught by the controller's error handler
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    
    return user;
  }

  createUser(userData: any) {
    if (this.emailExists(userData.email)) {
      throw new HttpError(HttpCode.CONFLICT, 'Email already exists', {
        email: userData.email,
        suggestion: 'Try logging in instead'
      });
    }
    
    return this.database.createUser(userData);
  }
}
```

## Decorator Validation

YasuiJS automatically validates your decorators at startup to catch common configuration errors. These errors are reported after server initialization but don't stop the server from running:

```typescript
// This will be detected and reported as an error
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // Circular dependency detected!
}

// Missing parameter decorator will be detected
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(id: string) { // Missing @Param('id') decorator
    return this.userService.findById(id);
  }
}
```

You can disable decorator validation in the configuration (not recommended):

```typescript
yasui.createServer({
  controllers: [UserController],
  enableDecoratorValidation: false // Unsafe - disables validation
});
```
