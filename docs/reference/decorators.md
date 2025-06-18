# Decorators Reference

This comprehensive guide covers all available decorators in YasuiJS. Decorators are the core feature that makes your code declarative and readable.

## Table of Contents

- [Route Decorators](#route-decorators)
- [Parameter Decorators](#parameter-decorators)
- [Swagger Decorators](#swagger-decorators)
- [Dependency Injection Decorators](#dependency-injection-decorators)
- [Middleware Decorators](#middleware-decorators)

## Route Decorators

Route decorators define HTTP endpoints and their corresponding HTTP methods.

### @Controller

Defines a controller class and its base route path.

**Syntax:**
```typescript
@Controller(path: string, ...middlewares?: Middleware[])
```

**Parameters:**
- `path` (string): Base path for all routes in the controller
- `...middlewares` (optional): Middleware classes to apply to all routes

**Basic Example:**
```typescript
@Controller('/users')
export class UserController {
  // All routes will be prefixed with /users
}
```

**With Middleware:**
```typescript
@Controller('/users', AuthMiddleware, LoggingMiddleware)
export class UserController {
  // All routes will use AuthMiddleware and LoggingMiddleware
}
```

**Nested Paths:**
```typescript
@Controller('/api/v1/users')
export class UserController {
  // Routes will be: /api/v1/users/...
}
```

### HTTP Method Decorators

#### @Get

Defines a GET endpoint.

**Syntax:**
```typescript
@Get(path?: string)
```

**Examples:**
```typescript
@Get('/')
getAllUsers() {
  return this.userService.getAllUsers();
}

@Get('/:id')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(id);
}

@Get('/search')
searchUsers(@Query('q') query: string) {
  return this.userService.searchUsers(query);
}
```

#### @Post

Defines a POST endpoint.

**Syntax:**
```typescript
@Post(path?: string)
```

**Examples:**
```typescript
@Post('/')
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}

@Post('/:id/activate')
activateUser(@Param('id') id: string) {
  return this.userService.activateUser(id);
}
```

#### @Put

Defines a PUT endpoint for full resource updates.

**Syntax:**
```typescript
@Put(path?: string)
```

**Examples:**
```typescript
@Put('/:id')
updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
  return this.userService.updateUser(id, userData);
}

@Put('/:id/password')
updatePassword(@Param('id') id: string, @Body() passwordData: PasswordDto) {
  return this.userService.updatePassword(id, passwordData);
}
```

#### @Patch

Defines a PATCH endpoint for partial resource updates.

**Syntax:**
```typescript
@Patch(path?: string)
```

**Examples:**
```typescript
@Patch('/:id')
patchUser(@Param('id') id: string, @Body() userData: Partial<UpdateUserDto>) {
  return this.userService.patchUser(id, userData);
}

@Patch('/:id/status')
updateStatus(@Param('id') id: string, @Body('status') status: string) {
  return this.userService.updateStatus(id, status);
}
```

#### @Delete

Defines a DELETE endpoint.

**Syntax:**
```typescript
@Delete(path?: string)
```

**Examples:**
```typescript
@Delete('/:id')
deleteUser(@Param('id') id: string) {
  return this.userService.deleteUser(id);
}

@Delete('/:id/soft')
softDeleteUser(@Param('id') id: string) {
  return this.userService.softDeleteUser(id);
}
```

## Parameter Decorators

Parameter decorators extract data from the HTTP request and inject it into your method parameters.

### @Param

Extracts route parameters from the URL path.

**Syntax:**
```typescript
@Param(paramName: string)
```

**Basic Example:**
```typescript
@Get('/users/:id')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

**Multiple Parameters:**
```typescript
@Get('/users/:userId/posts/:postId')
getUserPost(@Param('userId') userId: string, @Param('postId') postId: string) {
  return this.postService.getUserPost(parseInt(userId), parseInt(postId));
}
```

**With Type Conversion:**
```typescript
@Get('/users/:id')
getUser(@Param('id') id: string) {
  // Convert string to number
  const userId = parseInt(id);
  if (isNaN(userId)) {
    throw new Error('Invalid user ID');
  }
  return this.userService.getUserById(userId);
}
```

### @Query

Extracts query string parameters from the URL.

**Syntax:**
```typescript
@Query(paramName: string)
```

**Basic Example:**
```typescript
@Get('/users')
getUsers(@Query('page') page: string, @Query('limit') limit: string) {
  return this.userService.getUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
}
```

**With Default Values:**
```typescript
@Get('/users')
getUsers(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sort') sort: string = 'name'
) {
  return this.userService.getUsers({ page, limit, sort });
}
```

**Optional Parameters:**
```typescript
@Get('/users')
getUsers(
  @Query('page') page?: string,
  @Query('limit') limit?: string,
  @Query('search') search?: string
) {
  // Parameters are optional and may be undefined
  const filters = {
    page: page ? parseInt(page) : 1,
    limit: limit ? parseInt(limit) : 10,
    search: search || undefined
  };
  return this.userService.getUsers(filters);
}
```

**Multiple Query Parameters:**
```typescript
@Get('/users')
getUsers(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('sort') sort: string = 'name',
  @Query('order') order: 'asc' | 'desc' = 'asc'
) {
  return this.userService.getUsers({ page, limit, sort, order });
}
```

### @Body

Extracts the request body.

**Syntax:**
```typescript
@Body(propertyName?: string)
```

**Full Body:**
```typescript
@Post('/users')
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

**Specific Properties:**
```typescript
@Post('/users')
createUser(
  @Body('name') name: string,
  @Body('email') email: string,
  @Body('age') age: number
) {
  return this.userService.createUser({ name, email, age });
}
```

**Partial Body with Validation:**
```typescript
@Post('/users')
createUser(@Body() userData: CreateUserDto) {
  // Validate required fields
  if (!userData.name || !userData.email) {
    throw new Error('Name and email are required');
  }
  
  return this.userService.createUser(userData);
}
```

### @Header

Extracts request headers.

**Syntax:**
```typescript
@Header(headerName: string)
```

**Basic Example:**
```typescript
@Get('/users')
getUsers(@Header('authorization') auth: string) {
  return this.userService.getUsers(auth);
}
```

**Multiple Headers:**
```typescript
@Get('/users')
getUsers(
  @Header('authorization') auth: string,
  @Header('user-agent') userAgent: string,
  @Header('accept-language') language: string
) {
  return this.userService.getUsers(auth, userAgent, language);
}
```

**Optional Headers:**
```typescript
@Get('/users')
getUsers(@Header('authorization') auth?: string) {
  if (!auth) {
    throw new Error('Authorization header required');
  }
  return this.userService.getUsers(auth);
}
```

### @Req, @Res, @Next

Access the full Express.js request, response, and next function objects.

**Syntax:**
```typescript
@Req()
@Res()
@Next()
```

**Complete Example:**
```typescript
@Get('/users')
getUsers(
  @Req() req: Request,
  @Res() res: Response,
  @Next() next: NextFunction
) {
  // Full access to Express.js objects
  console.log('Request IP:', req.ip);
  console.log('User Agent:', req.get('User-Agent'));
  console.log('Request Method:', req.method);
  
  // Manual response handling
  const users = this.userService.getUsers();
  res.status(200).json({ 
    users,
    timestamp: new Date().toISOString()
  });
}
```

**Custom Response:**
```typescript
@Post('/users')
createUser(@Body() userData: CreateUserDto, @Res() res: Response) {
  const user = this.userService.createUser(userData);
  
  // Set custom headers
  res.set('Location', `/users/${user.id}`);
  res.status(201).json(user);
}
```

## Swagger Decorators

Swagger decorators generate OpenAPI documentation for your API endpoints.

### @ApiOperation

Defines the operation summary and description.

**Syntax:**
```typescript
@ApiOperation(summary: string, description?: string, tags?: string[])
```

**Basic Example:**
```typescript
@Get('/users/:id')
@ApiOperation('Get user by ID', 'Retrieves a specific user by their unique identifier')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

**With Tags:**
```typescript
@Get('/users/:id')
@ApiOperation('Get user by ID', 'Retrieves a specific user by their unique identifier', ['Users'])
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

### @ApiResponse

Defines response schemas and status codes.

**Syntax:**
```typescript
@ApiResponse(statusCode: number, description: string, schema?: any)
```

**Basic Example:**
```typescript
@Get('/users/:id')
@ApiResponse(200, 'Success', UserSchema)
@ApiResponse(404, 'User not found')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

**Multiple Responses:**
```typescript
@Post('/users')
@ApiResponse(201, 'User created successfully', UserSchema)
@ApiResponse(400, 'Invalid input data')
@ApiResponse(409, 'User already exists')
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

### @ApiParam

Documents route parameters.

**Syntax:**
```typescript
@ApiParam(name: string, description: string, required?: boolean, type?: string)
```

**Example:**
```typescript
@Get('/users/:id')
@ApiParam('id', 'User unique identifier', true, 'string')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

### @ApiQuery

Documents query parameters.

**Syntax:**
```typescript
@ApiQuery(name: string, description: string, required?: boolean, type?: string)
```

**Example:**
```typescript
@Get('/users')
@ApiQuery('page', 'Page number', false, 'number')
@ApiQuery('limit', 'Number of items per page', false, 'number')
@ApiQuery('search', 'Search term', false, 'string')
getUsers(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query('search') search?: string
) {
  return this.userService.getUsers({ page, limit, search });
}
```

### @ApiBody

Documents request body.

**Syntax:**
```typescript
@ApiBody(description: string, schema: any)
```

**Example:**
```typescript
@Post('/users')
@ApiBody('User data', CreateUserSchema)
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

### Complete Swagger Example

```typescript
@Controller('/api/users')
export class UserController {
  
  @Get('/')
  @ApiOperation('Get all users', 'Retrieves a paginated list of all users')
  @ApiQuery('page', 'Page number', false, 'number')
  @ApiQuery('limit', 'Items per page', false, 'number')
  @ApiResponse(200, 'Success', [UserSchema])
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getUsers(page, limit);
  }

  @Get('/:id')
  @ApiOperation('Get user by ID', 'Retrieves a specific user by their unique identifier')
  @ApiParam('id', 'User unique identifier', true, 'string')
  @ApiResponse(200, 'Success', UserSchema)
  @ApiResponse(404, 'User not found')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(parseInt(id));
  }

  @Post('/')
  @ApiOperation('Create user', 'Creates a new user account')
  @ApiBody('User data', CreateUserSchema)
  @ApiResponse(201, 'User created successfully', UserSchema)
  @ApiResponse(400, 'Invalid input data')
  @ApiResponse(409, 'User already exists')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }

  @Put('/:id')
  @ApiOperation('Update user', 'Updates an existing user account')
  @ApiParam('id', 'User unique identifier', true, 'string')
  @ApiBody('User data', UpdateUserSchema)
  @ApiResponse(200, 'User updated successfully', UserSchema)
  @ApiResponse(404, 'User not found')
  @ApiResponse(400, 'Invalid input data')
  updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    return this.userService.updateUser(parseInt(id), userData);
  }

  @Delete('/:id')
  @ApiOperation('Delete user', 'Deletes a user account')
  @ApiParam('id', 'User unique identifier', true, 'string')
  @ApiResponse(200, 'User deleted successfully')
  @ApiResponse(404, 'User not found')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(parseInt(id));
  }
}
```

## Dependency Injection Decorators

### @Injectable

Marks a class as injectable for dependency injection.

**Syntax:**
```typescript
@Injectable()
```

**Example:**
```typescript
@Injectable()
export class UserService {
  // Service implementation
}
```

### @Inject

Injects a dependency using a custom token.

**Syntax:**
```typescript
@Inject(token: string | symbol)
```

**Example:**
```typescript
@Controller('/users')
export class UserController {
  constructor(
    @Inject('DATABASE') private db: Database,
    private userService: UserService
  ) {}
}
```

### @Scope

Defines the scope of an injectable service.

**Syntax:**
```typescript
@Scope(scope: Scopes)
```

**Example:**
```typescript
@Injectable()
@Scope(Scopes.SINGLETON)
export class ConfigService {
  // Singleton service
}
```

## Middleware Decorators

### @Middleware

Applies middleware to a controller or route.

**Syntax:**
```typescript
@Middleware(middlewares: Middleware[])
```

**Controller-Level:**
```typescript
@Controller('/admin')
@Middleware([AuthMiddleware, AdminMiddleware])
export class AdminController {
  // All routes use AuthMiddleware and AdminMiddleware
}
```

**Route-Level:**
```typescript
@Controller('/users')
export class UserController {
  
  @Get('/')
  @Middleware([RateLimitMiddleware])
  getUsers() {
    return this.userService.getUsers();
  }
}
```

### @Use

Alternative syntax for applying middleware to routes.

**Syntax:**
```typescript
@Use(middleware: Middleware)
```

**Example:**
```typescript
@Controller('/users')
export class UserController {
  
  @Get('/')
  @Use(AuthMiddleware)
  @Use(RateLimitMiddleware)
  getUsers() {
    return this.userService.getUsers();
  }
}
```

## Best Practices

### Decorator Order

Follow this order for consistent code:

1. Class-level decorators (`@Controller`, `@Injectable`)
2. Method-level decorators (`@Get`, `@Post`, etc.)
3. Swagger decorators (`@ApiOperation`, `@ApiResponse`, etc.)
4. Middleware decorators (`@Middleware`, `@Use`)
5. Parameter decorators (`@Param`, `@Query`, `@Body`, etc.)

### Example with All Decorators

```typescript
@Controller('/api/users', LoggingMiddleware)
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/')
  @ApiOperation('Get all users', 'Retrieves a paginated list of users')
  @ApiResponse(200, 'Success', [UserSchema])
  @Middleware([RateLimitMiddleware])
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getUsers(page, limit);
  }

  @Post('/')
  @ApiOperation('Create user', 'Creates a new user account')
  @ApiBody('User data', CreateUserSchema)
  @ApiResponse(201, 'User created', UserSchema)
  @ApiResponse(400, 'Invalid data')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
}
```

### Type Safety

Always use TypeScript interfaces for your data structures:

```typescript
interface CreateUserDto {
  name: string;
  email: string;
  age?: number;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
  age?: number;
}

@Post('/')
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

### Error Handling

Use proper error handling with decorators:

```typescript
@Get('/:id')
getUser(@Param('id') id: string) {
  const userId = parseInt(id);
  if (isNaN(userId)) {
    throw new Error('Invalid user ID');
  }
  
  const user = this.userService.getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  return user;
}
```

## Next Steps

Now that you understand all the decorators, you can:

- **[Dependency Injection](/reference/dependency-injection)** - Learn how to inject dependencies
- **[Middleware](/reference/middleware)** - Apply middleware to your routes
- **[Configuration](/reference/configuration)** - Configure your application
- **[Error Handling](/reference/error-handling)** - Handle errors properly 