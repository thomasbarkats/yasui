# API Documentation (Swagger)

YasuiJS provides OpenAPI documentation generation with optional Swagger UI integration. It automatically generates documentation from your existing decorators and allows you to enhance it with additional metadata.

## Configuration

### Basic Setup

Enable Swagger by adding configuration to your app. YasuiJS generates documentation from your controllers, routes, and decorators.

Swagger UI assets are served from CDN by default - **no additional packages needed**.

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    info: {
      title: 'My API',
      version: '1.0.0',
    },
  }
});
```

Documentation will be accessible by default at `/api-docs` if no custom path specified, and JSON specification at `/<path>/swagger.json`.

### CDN Configuration

By default, YasuiJS loads Swagger UI assets from jsDelivr CDN (`https://cdn.jsdelivr.net/npm/swagger-ui-dist@5`). You can customize the CDN source or use self-hosted assets:

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',

    // Use alternative CDN (unpkg)
    cdn: 'https://unpkg.com/swagger-ui-dist@5',

    // Or pin to specific version
    // cdn: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0',

    // Or use self-hosted assets
    // cdn: '/swagger-ui',

    info: {
      title: 'My API',
      version: '1.0.0',
    },
  }
});
```

**CDN Benefits:**
- ✅ Zero installation - works out of the box
- ✅ Works on all runtimes (Node.js, Deno, Bun, edge environments)
- ✅ No file system dependencies
- ✅ Always up-to-date with latest Swagger UI

**Custom CDN Use Cases:**
- **Alternative CDN**: Use unpkg or other CDN providers
- **Specific version**: Pin to a particular Swagger UI version
- **Regional CDN**: Use faster CDN for your region
- **Self-hosted**: Serve assets from your own server or CDN
- **Offline/air-gapped**: Deploy with local assets in restricted environments

### Auto-Generated Documentation

YasuiJS automatically generates basic documentation from your existing controllers and route decorators, even without any Swagger-specific decorators. The framework detects:
- **Parameters**: Path parameters, query parameters, and headers are automatically detected with `string` type by default
- **Request body**: Automatically detected when present with `{}` schema by default
- **Responses**: Only the 200 status code (or the default status if `@HttpStatus` is present) is detected without schema information

The following sections describe how to enhance this documentation with additional metadata and precise typing.

### Complete Configuration

All standard OpenAPI 3.0 specification properties are supported and optional. The framework automatically handles `openapi`, `paths`, and `components` generation based on your decorators.

<details>
<summary>See complete example with all configuration options</summary>

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    // OpenAPI Info Object
    info: {
      title: 'User Management API',
      version: '2.1.0',
      description: 'Complete API for user management operations',
      termsOfService: 'https://example.com/terms',
      contact: {
        name: 'API Support',
        url: 'https://example.com/support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    // External Documentation
    externalDocs: {
      description: 'Find more info here',
      url: 'https://example.com/docs'
    },
    // Server Information
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Production server',
        variables: {
          version: {
            default: 'v1',
            enum: ['v1', 'v2'],
            description: 'API version'
          }
        }
      },
      {
        url: 'https://staging.example.com/v1',
        description: 'Staging server'
      }
    ],
    // Global Security Requirements
    security: [
      { bearerAuth: [] },
      { apiKeyAuth: [] }
    ],
    // Global Tags
    tags: [
      {
        name: 'users',
        description: 'User management operations',
        externalDocs: {
          description: 'Find out more',
          url: 'https://example.com/docs/users'
        }
      }
    ]
  }
});
```

</details>

## Schema Definition

YasuiJS uses TypeScript classes with property decorators to define API schemas. Properties are automatically inferred from TypeScript metadata when decorators are used without parameters.

Schemas are automatically registered if they are used in any decorators.

### `@ApiProperty(definition?)`
Defines a property, default required. Supports multiple definition formats:

```typescript
export class CreateUserDto {
  @ApiProperty() // Type inferred from TypeScript
  name: string;

  @ApiProperty([String]) // Array of primitives
  tags: string[];

  @ApiProperty(AddressDto) // Reference to another class
  address: AddressDto;

  @ApiProperty([AddressDto]) // Array of class references
  previousAddresses: AddressDto[];

  @ApiProperty({ enum: ['admin', 'user'] }) // Enum values
  role: string;

  @ApiProperty({ enum: UserStatus }) // TypeScript enum
  status: UserStatus;

  // OpenAPI schema, full customization
  @ApiProperty({ type: 'string', format: 'email' }) 
  username: string;

  @ApiProperty({
    theme: String,
    preferences: PreferencesDto,
    categories: [String],
    addresses: [AddressDto]
  }) // Record of previously listed usages
  settings: any;
}
```

Only primitive types can be inferred from TypeScript metadata. Complex types (including arrays) will default to `{ type: 'object' }`. For specific typing, use the explicit definition formats shown above.

### `@ApiPropertyOptional(definition?)`
Equivalent to `@ApiProperty({ required: false })`

```typescript
@ApiPropertyOptional()
description?: string;

@ApiPropertyOptional({ enum: ['small', 'medium', 'large'] })
size?: string;
```

### `@ApiSchema(name)`
Defines a custom schema name. Default name is the class name. Schema names must be unique.

```typescript
@ApiSchema('Create User Request')
export class CreateUserDto {
  @ApiProperty()
  name: string;
}
```

### Aliases
- `@AP()` - Alias for `@ApiProperty()`
- `@APO()` - Alias for `@ApiPropertyOptional()`

## Endpoint Documentation

### `@ApiBody(description?, definition?, contentType?)`
Documents request body schema. Default content type is `application/json`.

```typescript
@Post('/users')
@ApiBody('User data', CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```
All definition formats described for @ApiProperty (OpenAPI schema, Array of primitives, Array of class references, Record, Enum...) are valid for @ApiBody. Schemas of any class will be automatically resolved.

Also possible to use @ApiBody with class reference only without description (will be the schema name in this case).
```ts
@Post('/users')
@ApiBody(CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```

### `@ApiResponse(statusCode, description?, definition?)`
Documents endpoint responses.

```typescript
@Get('/users')
@ApiResponse(200, 'Users', [UserDto])
getUsers() {}
```
All definition formats described for @ApiProperty (OpenAPI schema, Array of primitives, Array of class references, Record, Enum...) are valid for @ApiResponse. Schemas of any class will be automatically resolved.

Also possible to use @ApiResponse with class reference only without description (will be the schema name in this case).
```typescript
@Get('/users/:id')
@ApiResponse(200, UserDto)
getUser(@Param('id') id: string) {}
```

### `@ApiOperation(summary, description?, tags?)`
Describes the endpoint operation.

```typescript
@Get('/users')
@ApiOperation('Get all users')
getUsers() {}

@Post('/users')
@ApiOperation('Create user', 'Creates a new user account', ['users'])
createUser() {}
```

### Parameter Documentation
- `@ApiParam(name, description?, required?, definition?)` - Path parameters
- `@ApiQuery(name, description?, required?, definition?)` - Query parameters  
- `@ApiHeader(name, description?, required?, definition?)` - Headers

All definition formats described for `@ApiProperty` and previous decorators are supported, but be mindful that complex usages (objects, arrays, class references, etc.) may not make sense depending on the decorator's nature, even though the OpenAPI schema will be correctly generated.

```typescript
@Get('/users/:id')
@ApiParam('id', 'User ID', true, Number)
@ApiQuery('include', 'Include related data', false, Boolean)
@ApiHeader('Authorization', 'Bearer token', true) // String by default
getUser(
  @Param('id') id: number,
  @Query('include') include?: boolean
) {}
```

## Error Responses

### `@ApiErrorResponse(statusCode, description?, ErrorDataClass?)`
Documents error responses with YasuiJS error wrapper format. This decorator automatically includes the framework's complete error schema structure that wraps all errors in your application.

```typescript
@Get('/users/:id')
@ApiErrorResponse(404, 'User not found')
@ApiErrorResponse(500, 'Internal server error')
getUser(@Param('id') id: string) {}
```

When you have custom error classes that extend `HttpError`, you can enhance them with `@ApiProperty` and `@ApiPropertyOptional` decorators to document their specific properties. The resulting schema will merge your custom error data with YasuiJS's standard error wrapper:

```typescript
@Post('/users')
@ApiErrorResponse(400, 'Validation failed', ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}

// Also possible with class reference only (description will be the schema name)
@Post('/users')
@ApiErrorResponse(400, ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}
```

### Alternative approach
If you prefer simpler error documentation without the complete wrapper format, you can continue using the standard `@ApiResponse` decorator described earlier. With `@ApiResponse`, if you pass a custom error class extending HttpError, you'll only get the schema of that specific class without inheriting any API definitions.

## Utility Functions

### `resolveSchema(schema: ApiPropertyDefinition): OpenAPISchema`
Manually resolves any schema definition (see formats described in @ApiProperty section) to OpenAPI format. Useful for specific use cases.

```typescript
import { resolveSchema } from 'yasui';
const schema = resolveSchema(CreateUserDto);
```
