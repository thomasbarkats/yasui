# Decorators

Decorators are the core feature of YasuiJS that make your code declarative and readable. This guide covers all available decorators and how to use them effectively.

## Route Decorators

Route decorators define HTTP endpoints and their corresponding HTTP methods.

### @Controller

Defines a controller class and its base route path.

```typescript
@Controller('/users')
export class UserController {
  // All routes in this controller will be prefixed with /users
}
```

**Parameters:**
- `path` (string): Base path for all routes in the controller
- `...middlewares` (optional): Middleware classes to apply to all routes

**Example with Middleware:**
```typescript
@Controller('/users', AuthMiddleware, LoggingMiddleware)
export class UserController {
  // All routes will use AuthMiddleware and LoggingMiddleware
}
```

### HTTP Method Decorators

#### @Get
```typescript
@Get('/users')
getUsers() {
  return this.userService.getUsers();
}
```

#### @Post
```typescript
@Post('/users')
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

#### @Put
```typescript
@Put('/users/:id')
updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
  return this.userService.updateUser(parseInt(id), userData);
}
```

#### @Delete
```typescript
@Delete('/users/:id')
deleteUser(@Param('id') id: string) {
  return this.userService.deleteUser(parseInt(id));
}
```

#### @Patch
```typescript
@Patch('/users/:id')
patchUser(@Param('id') id: string, @Body() userData: Partial<UpdateUserDto>) {
  return this.userService.patchUser(parseInt(id), userData);
}
```

## Parameter Decorators

Parameter decorators extract data from the HTTP request and inject it into your method parameters.

### @Param

Extracts route parameters.

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

### @Query

Extracts query string parameters.

```typescript
@Get('/users')
getUsers(@Query('page') page: string, @Query('limit') limit: string) {
  return this.userService.getUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
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
}
```

### @Body

Extracts the request body.

```typescript
@Post('/users')
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

**Partial Body:**
```typescript
@Post('/users')
createUser(@Body('name') name: string, @Body('email') email: string) {
  return this.userService.createUser({ name, email });
}
```

### @Header

Extracts request headers.

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
  @Header('user-agent') userAgent: string
) {
  return this.userService.getUsers(auth, userAgent);
}
```

### @Req, @Res, @Next

Access the full Express.js request, response, and next function objects.

```typescript
@Get('/users')
getUsers(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
  // Full access to Express.js objects
  console.log(req.ip);
  console.log(req.userAgent);
  
  // Manual response handling
  res.status(200).json({ users: [] });
}
```

## Swagger Decorators

Swagger decorators generate OpenAPI documentation for your API endpoints.

### @ApiOperation

Defines the operation summary and description.

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

Defines response schemas and descriptions.

```typescript
@Get('/users/:id')
@ApiResponse(200, 'User found successfully', UserSchema)
@ApiResponse(404, 'User not found')
@ApiResponse(500, 'Internal server error')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

**With Schema:**
```typescript
const UserSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    email: { type: 'string' }
  }
};

@Get('/users/:id')
@ApiResponse(200, 'User found successfully', UserSchema)
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

### @ApiParam

Defines path parameters.

```typescript
@Get('/users/:id')
@ApiParam('id', 'User ID', true, { type: 'number', example: 1 })
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

### @ApiQuery

Defines query parameters.

```typescript
@Get('/users')
@ApiQuery('page', 'Page number', false, { type: 'number', example: 1 })
@ApiQuery('limit', 'Number of items per page', false, { type: 'number', example: 10 })
getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
  return this.userService.getUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
}
```

### @ApiHeader

Defines request headers.

```typescript
@Get('/users')
@ApiHeader('authorization', 'Bearer token', true, { type: 'string' })
getUsers(@Header('authorization') auth: string) {
  return this.userService.getUsers(auth);
}
```

### @ApiBody

Defines request body schema.

```typescript
const CreateUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', example: 'John Doe' },
    email: { type: 'string', example: 'john@example.com' }
  },
  required: ['name', 'email']
};

@Post('/users')
@ApiBody('User data', CreateUserSchema)
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

## Dependency Injection Decorators

### @Injectable

Marks a class as injectable for dependency injection.

```typescript
@Injectable()
export class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}
```

### @Inject

Injects dependencies by token or type.

```typescript
@Controller('/users')
export class UserController {
  constructor(
    @Inject('DATABASE') private db: Database,
    @Inject() private userService: UserService
  ) {}
}
```

### @Scope

Defines the scope of injected dependencies.

```typescript
@Injectable()
export class UserService {
  constructor(
    @Scope(Scopes.SINGLETON) private config: ConfigService,
    @Scope(Scopes.REQUEST) private logger: LoggerService
  ) {}
}
```

## HTTP Status Decorators

### @HttpStatus

Sets the default HTTP status code for the response.

```typescript
@Post('/users')
@HttpStatus(HttpCode.CREATED)
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

**Available Status Codes:**
```typescript
import { HttpCode } from 'yasui';

HttpCode.OK           // 200
HttpCode.CREATED      // 201
HttpCode.NO_CONTENT   // 204
HttpCode.BAD_REQUEST  // 400
HttpCode.UNAUTHORIZED // 401
HttpCode.FORBIDDEN    // 403
HttpCode.NOT_FOUND    // 404
HttpCode.CONFLICT     // 409
HttpCode.INTERNAL_SERVER_ERROR // 500
```

## Middleware Decorators

### @Use

Applies middleware to a specific route.

```typescript
@Get('/users')
@Use(AuthMiddleware)
@Use(RateLimitMiddleware)
getUsers() {
  return this.userService.getUsers();
}
```

## Best Practices

### 1. Keep Decorators Simple

```typescript
// Good
@Get('/users/:id')
@ApiOperation('Get user by ID')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}

// Avoid complex logic in decorators
```

### 2. Use TypeScript Types

```typescript
// Good - with proper types
@Post('/users')
createUser(@Body() userData: CreateUserDto): User {
  return this.userService.createUser(userData);
}

// Avoid - without types
@Post('/users')
createUser(@Body() userData: any) {
  return this.userService.createUser(userData);
}
```

### 3. Group Related Decorators

```typescript
// Good - logical grouping
@Get('/users/:id')
@ApiOperation('Get user by ID', 'Retrieves user information')
@ApiParam('id', 'User ID', true)
@ApiResponse(200, 'Success', UserSchema)
@ApiResponse(404, 'User not found')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(parseInt(id));
}
```

### 4. Use Consistent Naming

```typescript
// Good - consistent naming
@Controller('/users')
export class UserController {
  @Get('/')
  getUsers() { /* ... */ }
  
  @Get('/:id')
  getUser(@Param('id') id: string) { /* ... */ }
  
  @Post('/')
  createUser(@Body() userData: CreateUserDto) { /* ... */ }
}
```

### 5. Leverage Swagger Decorators

```typescript
// Good - comprehensive documentation
@Get('/users')
@ApiOperation('Get all users', 'Retrieves a paginated list of users')
@ApiQuery('page', 'Page number', false)
@ApiQuery('limit', 'Items per page', false)
@ApiResponse(200, 'Success', UsersSchema)
@ApiResponse(400, 'Bad request')
getUsers(@Query('page') page?: string, @Query('limit') limit?: string) {
  return this.userService.getUsers({
    page: parseInt(page) || 1,
    limit: parseInt(limit) || 10
  });
}
```

## Common Patterns

### CRUD Operations

```typescript
@Controller('/users')
export class UserController {
  
  @Get('/')
  @ApiOperation('Get all users')
  getUsers() {
    return this.userService.getUsers();
  }
  
  @Get('/:id')
  @ApiOperation('Get user by ID')
  @ApiParam('id', 'User ID', true)
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(parseInt(id));
  }
  
  @Post('/')
  @HttpStatus(HttpCode.CREATED)
  @ApiOperation('Create new user')
  @ApiBody('User data', CreateUserSchema)
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
  
  @Put('/:id')
  @ApiOperation('Update user')
  @ApiParam('id', 'User ID', true)
  updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    return this.userService.updateUser(parseInt(id), userData);
  }
  
  @Delete('/:id')
  @ApiOperation('Delete user')
  @ApiParam('id', 'User ID', true)
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(parseInt(id));
  }
}
```

### Error Handling

```typescript
@Get('/users/:id')
@ApiOperation('Get user by ID')
@ApiResponse(200, 'Success', UserSchema)
@ApiResponse(404, 'User not found')
@ApiResponse(500, 'Internal server error')
getUser(@Param('id') id: string) {
  const user = this.userService.getUserById(parseInt(id));
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}
```

## Next Steps

Now that you understand decorators, you can:

- [Learn about Dependency Injection](/guide/dependency-injection)
- [Explore Middleware patterns](/guide/middleware)
- [Master Configuration options](/guide/configuration)
- [Build Advanced APIs](/guide/advanced-patterns) 