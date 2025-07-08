# Controllers

Controllers are the entry points of your API. They define HTTP endpoints and handle incoming requests by extracting data, calling business logic, and returning responses.

## Overview

In YasuiJS, controllers are classes decorated with `@Controller()` that group related endpoints together. Each method in a controller represents an HTTP endpoint, defined using method decorators like `@Get()`, `@Post()`, etc.

Controller methods can simply return any value, which will be automatically serialized to JSON with a 200 status code. For more control, you can access the Express response object directly using `@Res()` and use native Express methods like `res.json()`, `res.status()`, or `res.sendFile()`.

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // Automatically returns JSON
  }

  @Post('/')
  createUser() {
    return { message: 'User created' }; // Automatically returns JSON
  }
}
```

## Controller Decorator

The `@Controller()` decorator marks a class as a controller and defines the base path for all its routes.

### Basic Usage

```typescript
@Controller('/api/users')
export class UserController {
  // All routes will be prefixed with /api/users
}
```

### With Middleware

You can apply middleware to all routes in a controller. Learn more in [Middlewares](/reference/middlewares).

```typescript
import { AuthMiddleware } from './middleware/auth.middleware';

@Controller('/api/users', AuthMiddleware)
export class UserController {
  // All routes will have AuthMiddleware applied
}
```

## HTTP Method Decorators

YasuiJS provides decorators for all standard HTTP methods. Each decorator takes a path parameter (required) and optional middleware parameters.

- `@Get(path, ...middlewares)` - Handle GET requests
- `@Post(path, ...middlewares)` - Handle POST requests
- `@Put(path, ...middlewares)` - Handle PUT requests
- `@Delete(path, ...middlewares)` - Handle DELETE requests
- `@Patch(path, ...middlewares)` - Handle PATCH requests

### Basic Routes

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] };
  }

  @Get('/:id')
  getUser() {
    return { user: {} };
  }

  @Post('/')
  createUser() {
    return { message: 'User created' };
  }

  @Put('/:id')
  updateUser() {
    return { message: 'User updated' };
  }

  @Delete('/:id')
  deleteUser() {
    return { message: 'User deleted' };
  }
}
```

### Route Parameters

Use Express-style route parameters in your paths:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser() {
    // Route: GET /api/users/123
  }

  @Get('/:id/posts/:postId')
  getUserPost() {
    // Route: GET /api/users/123/posts/456
  }

  @Get('/search/:category?')
  searchUsers() {
    // Route: GET /api/users/search or /api/users/search/admin
  }
}
```

### Route-Level Middleware

Apply middleware to specific routes. Learn more in [Middlewares](/reference/middlewares).

```typescript
import { ValidationMiddleware, AuthMiddleware } from './middleware';

@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {
    // Only this route has ValidationMiddleware
  }

  @Post('/', AuthMiddleware, ValidationMiddleware)
  createUser() {
    // This route has both middlewares
  }
}
```

## Parameter Decorators

Extract data from HTTP requests using parameter decorators. All parameter decorators can be used with or without a parameter name to extract specific values or entire objects.

### Request Object Access

- `@Req()` - Access Express Request object (no parameters)
- `@Res()` - Access Express Response object (no parameters)
- `@Next()` - Access Express NextFunction (no parameters)

Access Express request, response, and next objects:

```typescript
import { Request, Response, NextFunction } from 'express';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction
  ) {
    // Direct access to Express objects
    console.log(request.url);
    return { users: [] };
  }
}
```

### Extract Route Parameters

- `@Param(name?)` - Extract route parameters (optional parameter name)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    // Extract specific parameter
    return { userId: id };
  }

  @Get('/:id/posts/:postId')
  getUserPost(
    @Param('id') userId: string,
    @Param('postId') postId: string
  ) {
    // Extract multiple parameters
    return { userId, postId };
  }

  @Get('/all')
  getAllWithParams(@Param() params: any) {
    // Get all route parameters as object
    return { params };
  }
}
```

### Extract Query Parameters

- `@Query(name?)` - Extract query parameters (optional parameter name)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    // Extract specific query parameters with defaults
    return { page, limit };
  }

  @Get('/search')
  searchUsers(@Query() query: any) {
    // Get all query parameters as object
    return { searchParams: query };
  }
}
```

### Extract Request Body

- `@Body(name?)` - Extract request body data (optional parameter name)

```typescript
@Controller('/api/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    // Extract entire request body
    return { created: userData };
  }

  @Post('/partial')
  updateUser(@Body('name') name: string) {
    // Extract specific field from body
    return { updatedName: name };
  }
}
```

### Extract Headers

- `@Header(name?)` - Extract request headers (optional parameter name)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Header('authorization') auth: string) {
    // Extract specific header
    return { authHeader: auth };
  }

  @Get('/all-headers')
  getUsersWithHeaders(@Header() headers: any) {
    // Get all headers as object
    return { headers };
  }
}
```

## Response Handling

YasuiJS automatically handles response serialization and status codes.

### Automatic JSON Responses

Return any data and it will be automatically serialized to JSON:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // Automatically returns JSON with status 200
    return { users: ['John', 'Jane'] };
  }

  @Get('/string')
  getString() {
    // Returns string as JSON
    return 'Hello World';
  }

  @Get('/number')
  getNumber() {
    // Returns number as JSON
    return 42;
  }
}
```

### Custom Status Codes

- `@HttpStatus(code)` - Set custom HTTP status code (required status code parameter, accepts number or HttpCode enum)

Use the `@HttpStatus()` decorator to set custom status codes:

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/')
  @HttpStatus(201) // Using number
  createUser(@Body() userData: any) {
    // Returns with status 201 Created
    return { created: userData };
  }

  @Post('/alt')
  @HttpStatus(HttpCode.CREATED) // Using HttpCode enum
  createUserAlt(@Body() userData: any) {
    // Returns with status 201 Created
    return { created: userData };
  }

  @Delete('/:id')
  @HttpStatus(HttpCode.NO_CONTENT) // Using HttpCode enum
  deleteUser(@Param('id') id: string) {
    // Returns with status 204 No Content
    // Can return nothing for 204
  }
}
```

### Manual Response Handling

For complete control, use the Express response object:

```typescript
import { Response } from 'express';

@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse(@Res() res: Response) {
    res.status(418).json({ 
      message: "I'm a teapot",
      custom: true 
    });
    // Don't return anything when using res directly
  }

  @Get('/file')
  downloadFile(@Res() res: Response) {
    res.download('/path/to/file.pdf');
  }
}
```

## Error Handling

Let the framework handle errors automatically or throw custom errors. For complete error handling details, see [Error Handling](/reference/error-handling).

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.findById(id);
    
    if (!user) {
      // Throw custom HTTP error
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    
    return user;
  }
}
```
