# Error Handling

YasuiJS provides automatic error handling and formatting for both logging and client responses. All controller methods are automatically wrapped with error handling to catch and process any thrown errors.

## Overview

When an error occurs in your application, YasuiJS automatically:
- Logs the error with detailed information (URL, method, status, message)
- Formats and sends it to the client as a JSON response
- Includes HTTP status code, error details, request information, and any additional error data

```typescript
@Get('/:id')
getUser(@Param('id') id: string) {
  const user = this.userService.findById(id);

  if (!user) {
    // This error will be automatically caught and formatted
    throw new Error('User not found');
  }
  return user;
}
```

## Custom Error Handling

### HttpError Class

The default HTTP status returned if you raise an `Error` will be 500 (Internal Server Error). To specify the expected HTTP return status corresponding to your error, raise an `HttpError`:

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/users')
export class UserController {

 @Get('/:id')
 getUser(@Param('id') id: string) {
   const user = this.userService.findById(id);

   if (!user) {
     throw new HttpError(HttpCode.NOT_FOUND, `User ${id} not found`);
   }
   return user;
 }
}
```

You can specify a code as a number (eg. 400) or use the provided enumeration `HttpCode` as in the example. For a complete list of HTTP status codes and their meanings, see the [HTTP response status codes documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

### Custom Error Classes

Create custom errors with specific status codes and additional data by extending or using the `HttpError` class. Your custom error must set `status` and `message` properties by calling the parent constructor, and can include any additional properties.

```typescript
class ValidationError extends HttpError {
  fields: string[];

  constructor(fields: string[]) {
    super(HttpCode.BAD_REQUEST, 'Missing required fields');
    this.fields = fields;
  }
}

@Controller('/users')
export class UserController {

  @Post('/')
  createUser(@Body() userData: any) {
    const missingFields = this.validateUserData(userData);

    if (missingFields.length > 0) {
      throw new ValidationError(missingFields);
    }
    return this.userService.createUser(userData);
  }
}
```
Additional properties will be included in the formatted response from Yasui.

## Error Response Format

When an error is thrown, YasuiJS automatically formats it into a consistent JSON response:

```json
{
  "url": "http://localhost:3000/api/users/123",
  "path": "/api/users/123",
  "method": "POST",
  "name": "ValidationError", // Error class name
  "message": "Missing required fields",
  "statusMessage": "Bad Request", // HTTP status message
  "status": 404, // HTTP status code
  "data": {
    "fields": ["name", "age"]
  }
}
```

The properties of custom errors inheriting from HttpError will be included in `data`.

## Error Handling in Services

Services or any Injectable can throw errors that will be automatically caught when called from controllers:

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
}
```

## Error Logs

In debug mode (`debug` option in Yasui configuration), all errors returned by endpoints will be logged. In production, only 500 errors (Internal Server Error) will be logged, considering that they are unexpected and are not usually business errors.

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
