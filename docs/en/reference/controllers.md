# Controllers

Controllers are the entry points of your API. They define HTTP endpoints and handle incoming requests by extracting data, calling business logic, and returning responses.

## Overview

In YasuiJS, controllers are classes decorated with `@Controller()` that group related endpoints together. Each method in a controller represents an HTTP endpoint, defined using method decorators like `@Get()`, `@Post()`, etc.

Controller methods can simply return any value, which will be automatically serialized to JSON with a 200 status code. For manual response control, you can return a Web Standards Response object directly.

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

`@Body(name?)` - Extract request body data

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

- `@Param(name, items?)` - Extract route parameters
- `@Query(name, items?)` - Extract query parameters
- `@Header(name, items?)` - Extract request headers

Parameters are automatically transformed based on their TypeScript types. For arrays with non-string types, you must specify the item type as the second parameter:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: number) {} // Converted to number.

  @Get('/search/:term')
  searchUsers(
    @Param('term') term: string,
    @Header('x-api-version') version: number,
    @Query('filters', [Boolean]) filters: boolean[],
    @Query('settings') settings: { theme: string } | null,
  ) {
    // version: number (header converted to number)
    // filters: boolean[] (from ?filters=true&filters=false&filters=1)
    // settings: object (from ?settings={"theme":"dark"} - JSON parsed, null if fails)
    return { page, active, tags, priorities };
  }
}
```

## Automatic Parameter Types Casting

YasuiJS automatically converts parameters based on TypeScript types:

### Basic Types
- **string** - No conversion (default)
- **number** - Converts to number, returns NaN if invalid
- **boolean** - Converts "true"/"1" to true, everything else to false
- **Date** - Converts to Date object, returns Invalid Date if invalid
- **object** - Parses JSON strings for queries like `?data={"key":"value"}`, returns `null` if fails

### Array Types
TypeScript cannot detect array item types at runtime, so you must specify `[Type]` for non-string arrays:

- **string[]** - No additional configuration needed (default behavior)
- **number, boolean, or Date arrays** - Must specify the item type using the second parameter

**Typed Array Syntax:**
```typescript
@Query('paramName', [Type]) paramName: Type[]
@Param('paramName', [Type]) paramName: Type[]  
@Header('headerName', [Type]) headerName: Type[]
```

## Request Object Access

`@Req()` - Access YasuiJS Request object (Web Standards Request with Express-compatible properties)

```typescript
import { Request } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(@Req() request: Request) {
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

`@HttpStatus(code)` - Set custom HTTP status code

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

For complete control, return a Web Standards Response object:

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse() {
    return new Response(JSON.stringify({
      message: "I'm a teapot",
      custom: true
    }), {
      status: 418,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  @Get('/text')
  textResponse() {
    return new Response('Plain text response', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
```

## Error Handling

Let the framework handle errors automatically or throw custom errors. For complete error handling details, see [Error Handling](/reference/error-handling).
