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
- **boolean** - Converts "true"/"1" to true, everything else to false
- **number** - Converts to number, returns `NaN` if invalid (or throws with `strictValidation`)
- **Date** - Converts to Date object, returns `Invalid Date` if invalid (or throws ``)
- **object** - Parses JSON strings for queries like `?data={"key":"value"}`, returns `null` if fails (or throws ``)

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

### Enum Validation

Enum constraints can be enforced by defining a set of allowed values for parameter validation:

```typescript
// Define allowed values using 'as const' (recommended TypeScript pattern)
const LANGS = ['en', 'fr', 'es'] as const;
type Lang = typeof LANGS[number];

// Or use a TypeScript enum
enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest'
}

@Controller('/api')
export class ApiController {
  @Get('/content')
  getContent(
    @Query('lang', LANGS) lang?: Lang,        // Validates ['en', 'fr', 'es']
    @Query('role', UserRole) role?: UserRole, // Validates enum values
  ) {
    return { lang, role };
  }
}
```

**Behavior:**
- If the value matches one of the allowed enum values, it is returned as-is
- For numeric enums, automatic conversion is attempted (e.g., `"1"` → `1`)
- With `strictValidation: false` (default): Returns `null` for invalid values
- With `strictValidation: true`: Throws HTTP 400 error with descriptive message

### Strict Validation Mode

By default, YasuiJS returns invalid values (NaN, Invalid Date, null) when type casting fails. Enable `strictValidation` in your config to throw an HTTP 400 error instead:

```typescript
yasui.createServer({
  controllers: [UserController],
  strictValidation: true  // Throw errors on type casting failures
});
```

**Default behavior (strictValidation: false):**
```typescript
@Get('/:id')
getUser(@Param('id') id: number) {
  // GET /user/abc → id = NaN (silently fails)
  // GET /user/123 → id = 123
}

@Get('/search')
search(@Query('date') date: Date) {
  // GET /search?date=invalid → date = Invalid Date
  // GET /search?date=2024-01-01 → date = Date object
}
```

**Strict validation (strictValidation: true):**
```typescript
@Get('/:id')
getUser(@Param('id') id: number) {
  // GET /user/abc → throws HttpError(400, "Parameter 'id' expected number, got 'abc'")
  // GET /user/123 → id = 123
}

@Get('/search')
search(
  @Query('date') date: Date,
  @Query('ids', [Number]) ids: number[]
) {
  // GET /search?date=invalid
  //   → throws HttpError(400, "Parameter 'date' expected valid date, got 'invalid'")

  // GET /search?ids=1&ids=2&ids=abc
  //   → throws HttpError(400, "Parameter 'ids[2]' expected number, got 'abc'")
}
```

**JSON body parsing:**
```typescript
@Post('/')
createUser(@Body() data: any) {
  // With strictValidation: false
  //   Invalid JSON → data = undefined (silent failure)

  // With strictValidation: true
  //   Invalid JSON → throws HttpError(400, "Failed to parse JSON body: ...")
}
```

See [Configuration](/reference/config#strictvalidation) for more details.

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

**Available request properties:**
- `url` - Full request URL
- `method` - HTTP method (GET, POST, etc.)
- `headers` - Native Headers object (web-standard)
- `flatHeaders` - Plain object for Express-style access
- `params` - Route parameters
- `query` - Query string parameters
- `cookies` - Parsed cookies
- `body` - Native ReadableStream (web-standard)
- `parsedBody` - Parsed JSON body (cached)
- `path` - Request pathname
- `hostname` - Request hostname
- `protocol` - Request protocol (http/https)
- `ip` - Client IP address

### Headers Access

YasuiJS provides two ways to access headers:

**Web Standards (recommended):**
```typescript
@Get('/')
getUsers(@Req() req: Request) {
  const auth = req.headers.get('authorization');
  const type = req.headers.get('content-type');
}
```

**Express-style (plain object):**
```typescript
@Get('/')
getUsers(@Req() req: Request) {
  const auth = req.flatHeaders.authorization;        // Dot notation
  const type = req.flatHeaders['content-type'];      // Bracket notation
}
```

### Creating Custom Request Decorators

You can create your own decorators to extract specific properties from the request object using `routeRequestParamDecorator`.

```typescript
import { routeRequestParamDecorator } from 'yasui';

// Create custom decorator for request IP
export const Ip = routeRequestParamDecorator('ip');

// Use in controller
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Ip() ip: string) {
    console.log(`Request from ${ip}`);
    return { users: [] };
  }
}
```

This approach is preferred over using `@Req()` for single property access, as it:
- Improves code readability
- Enables type safety

See [Request Object Access](#request-object-access) for the full list of available request properties.

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

By default, all returned values are automatically serialized to JSON. To return non-JSON formats (HTML, XML, files, etc.), you must return a Web Standards Response object with the appropriate `Content-Type` header:

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

  @Get('/download')
  downloadFile() {
    const fileBuffer = new Uint8Array([/* file data */]);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="report.pdf"'
      }
    });
  }
}
```

## Error Handling

Let the framework handle errors automatically or throw custom errors. For complete error handling details, see [Error Handling](/reference/error-handling).
