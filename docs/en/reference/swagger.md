# API Documentation (Swagger)

YasuiJS provides OpenAPI documentation generation with optional Swagger UI integration. It automatically generates documentation from your existing decorators and allows you to enhance it with additional metadata.

## Configuration

### Basic Setup

Enable Swagger by adding configuration to your app. YasuiJS automatically generates documentation from your controllers, routes, and decorators.

**Note**: You need to install `swagger-ui-express` separately:
```bash
npm install swagger-ui-express
```

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    info: {
      title: 'My API',
      version: '1.0.0'
    }
  }
});
```

The documentation will be accessible at `/api-docs` (default path) and the JSON specification at `/api-docs.json`.

### Complete Configuration

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    path: '/docs', // Custom path
    info: {
      title: 'User Management API',
      version: '2.1.0',
      description: 'Complete API for user management operations',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  }
});
```

## Enhanced Documentation

Enrich the default API documentation with optional decorators. All decorators are attached to the endpoint's method:

### API Operation

- `@ApiOperation(summary, description?, tags?)` - Describe the endpoint

```typescript
import { ApiOperation } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/')
  @ApiOperation('Get all users', 'Retrieve a list of all users in the system', ['users'])
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/')
  @ApiOperation('Create user', 'Create a new user account')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Parameters Documentation

- `@ApiParam(name, description?, required?, schema?)` - Document path parameters
- `@ApiQuery(name, description?, required?, schema?)` - Document query parameters  
- `@ApiHeader(name, description?, required?, schema?)` - Document headers

```typescript
import { ApiParam, ApiQuery, ApiHeader } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiParam('id', 'User unique identifier', true, { type: 'string' })
  @ApiHeader('Authorization', 'Bearer token for authentication', true)
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('/')
  @ApiQuery('page', 'Page number for pagination', false, { type: 'number', default: 1 })
  @ApiQuery('limit', 'Number of items per page', false, { type: 'number', default: 10 })
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getUsers({ page, limit });
  }
}
```

### Request Body Documentation

- `@ApiBody(description?, schema?)` - Document request body

```typescript
import { ApiBody } from 'yasui';

@Controller('/users')
export class UserController {
  @Post('/')
  @ApiBody('User creation data', {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'User full name' },
      email: { type: 'string', format: 'email', description: 'User email address' },
      age: { type: 'number', minimum: 18, description: 'User age (must be 18+)' }
    },
    required: ['name', 'email']
  })
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Response Documentation

- `@ApiResponse(statusCode, description, schema?)` - Document responses

```typescript
import { ApiResponse } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiResponse(200, 'User found successfully', {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  })
  @ApiResponse(404, 'User not found')
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  @ApiResponse(201, 'User created successfully')
  @ApiResponse(400, 'Invalid user data')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

## Error Responses

`ErrorResourceSchema` generates a schema for YasuiJS's error wrapper format. You can optionally define additional fields that will be included in the `data` property for your custom errors:

```typescript
import { ApiResponse, ErrorResourceSchema } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiResponse(404, 'User not found', ErrorResourceSchema())
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  @ApiResponse(400, 'Validation failed', ErrorResourceSchema({
    fields: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'List of invalid fields' 
    }
  }, {
    fields: ['email', 'password']
  }))
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```
