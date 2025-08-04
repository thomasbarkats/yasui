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

  @Post('/')
  createUser() {
    return { message: 'User created' };
  }

  @Get('/:id')
  getUser() {
    // Use Express-style route parameters in your paths:
    // Route: GET /api/users/123
    return { user: {} };
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

### Route-Level Middleware

Apply middleware to specific routes. Learn more in [Middlewares](/reference/middlewares).

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {}
}
```

## Parameter Decorators

Extract data from HTTP requests using parameter decorators. YasuiJS automatically transforms parameters based on their TypeScript types for better type safety.

### Extract Request Body

- `@Body(name?)` - Extract request body data

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

### Extract Parameters & Headers

- `@Param(name)` - Extract route parameters
- `@Query(name)` - Extract query parameters
- `@Header(name?)` - Extract request headers

Parameters are automatically transformed based on their TypeScript types:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: number) { 
    // Automatically converted to number
  }

  @Get('/search')
  searchUsers(
    @Query('page') page: number,
    @Query('active') active: boolean,
    @Query('tags') tags: string[]
  ) {
    // page: number (converted from "123" to 123)
    // active: boolean (converted from "true"/"1" to true)
    // tags: string[] (from ?tags=red&tags=blue)
    return { page, active, tags };
  }

  @Get('/profile')
  getProfile(
    @Query('settings') settings: { theme: string },
    @Header('x-api-version') version: number
  ) {
    // settings: object (from ?settings={"theme":"dark"} - JSON parsed)
    // version: number (header converted to number)
    return { settings, version };
  }
}
```

### Supported Type Transformations

YasuiJS automatically converts parameters based on TypeScript types:

- **string** - No conversion (default)
- **number** - Converts to number, returns NaN if invalid
- **boolean** - Converts "true"/"1" to true, everything else to false
- **Date** - Converts to Date object, returns Invalid Date if invalid
- **string[]** - For query arrays like `?tags=red&tags=blue`
- **object** - Parses JSON strings for queries like `?data={"key":"value"}`

### Request Object Access

- `@Req()` - Access Express Request object
- `@Res()` - Access Express Response object
- `@Next()` - Access Express NextFunction

```typescript
import { Request, Response, NextFunction } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction
  ) {
    console.log(request.url);
    return { users: [] };
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

- `@HttpStatus(code)` - Set custom HTTP status code

Use the `@HttpStatus()` decorator to set custom status codes:

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/alt')
  @HttpStatus(201) // Using number
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
import { Response } from 'yasui';

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
}
```

## Error Handling

Let the framework handle errors automatically or throw custom errors. For complete error handling details, see [Error Handling](/reference/error-handling).
