# API 文档 (Swagger)

YasuiJS 提供 OpenAPI 文档生成功能，可选择集成 Swagger UI。它会自动从现有的装饰器生成文档，并允许您通过额外的元数据来增强文档。

## 配置

### 基本设置

通过向应用添加配置来启用 Swagger。YasuiJS 会从您的控制器、路由和装饰器生成文档。

Swagger UI 资源默认从 CDN 提供 - **无需额外的包**。

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

如果未指定自定义路径，文档默认可在 `/api-docs` 访问，JSON 规范在 `/<path>/swagger.json` 访问。

### CDN 配置

默认情况下，YasuiJS 从 jsDelivr CDN (`https://cdn.jsdelivr.net/npm/swagger-ui-dist@5`) 加载 Swagger UI 资源。您可以自定义 CDN 源或使用自托管资源：

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',

    // 使用替代 CDN (unpkg)
    cdn: 'https://unpkg.com/swagger-ui-dist@5',

    // 或固定到特定版本
    // cdn: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0',

    // 或使用自托管资源
    // cdn: '/swagger-ui',

    info: {
      title: 'My API',
      version: '1.0.0',
    },
  }
});
```

**CDN 优势：**
- ✅ 零安装 - 开箱即用
- ✅ 适用于所有运行时（Node.js、Deno、Bun、边缘环境）
- ✅ 无文件系统依赖
- ✅ 始终使用最新的 Swagger UI

**自定义 CDN 用例：**
- **替代 CDN**：使用 unpkg 或其他 CDN 提供商
- **特定版本**：固定到特定的 Swagger UI 版本
- **区域 CDN**：使用针对您所在地区更快的 CDN
- **自托管**：从您自己的服务器或 CDN 提供资源
- **离线/隔离网络**：在受限环境中使用本地资源部署

### 自动生成文档

YasuiJS 会自动从现有的控制器和路由装饰器生成基本文档，即使没有任何 Swagger 特定的装饰器。框架会检测：
- **参数**：路径参数、查询参数和请求头会自动检测，默认类型为 `string`
- **请求体**：存在时会自动检测，默认模式为 `{}`
- **响应**：仅检测 200 状态码（如果存在 `@HttpStatus` 则为默认状态），不包含模式信息

以下部分描述如何通过额外的元数据和精确类型来增强此文档。

### 完整配置

支持所有标准 OpenAPI 3.0 规范属性，且都是可选的。框架会根据您的装饰器自动处理 `openapi`、`paths` 和 `components` 的生成。

<details>
<summary>查看包含所有配置选项的完整示例</summary>

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    // OpenAPI Info 对象
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
    // 外部文档
    externalDocs: {
      description: 'Find more info here',
      url: 'https://example.com/docs'
    },
    // 服务器信息
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
    // 全局安全要求
    security: [
      { bearerAuth: [] },
      { apiKeyAuth: [] }
    ],
    // 全局标签
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

## 模式定义

YasuiJS 使用带有属性装饰器的 TypeScript 类来定义 API 模式。当装饰器不带参数使用时，属性会自动从 TypeScript 元数据推断。

如果模式在任何装饰器中使用，它们会自动注册。

### `@ApiProperty(definition?)`
定义属性，默认为必需。支持多种定义格式：

```typescript
export class CreateUserDto {
  @ApiProperty() // 类型从 TypeScript 推断
  name: string;

  @ApiProperty([String]) // 基本类型数组
  tags: string[];

  @ApiProperty(AddressDto) // 引用另一个类
  address: AddressDto;

  @ApiProperty([AddressDto]) // 类引用数组
  previousAddresses: AddressDto[];

  @ApiProperty({ enum: ['admin', 'user'] }) // 枚举值
  role: string;

  @ApiProperty({ enum: UserStatus }) // TypeScript 枚举
  status: UserStatus;

  // OpenAPI 模式，完全自定义
  @ApiProperty({ type: 'string', format: 'email' }) 
  username: string;

  @ApiProperty({
    theme: String,
    preferences: PreferencesDto,
    categories: [String],
    addresses: [AddressDto]
  }) // 之前列出的用法记录
  settings: any;
}
```

只有基本类型可以从 TypeScript 元数据推断。复杂类型（包括数组）将默认为 `{ type: 'object' }`。对于特定类型，请使用上面显示的显式定义格式。

### `@ApiPropertyOptional(definition?)`
等同于 `@ApiProperty({ required: false })`

```typescript
@ApiPropertyOptional()
description?: string;

@ApiPropertyOptional({ enum: ['small', 'medium', 'large'] })
size?: string;
```

### `@ApiSchema(name)`
定义自定义模式名称。默认名称是类名。模式名称必须唯一。

```typescript
@ApiSchema('Create User Request')
export class CreateUserDto {
  @ApiProperty()
  name: string;
}
```

### 别名
- `@AP()` - `@ApiProperty()` 的别名
- `@APO()` - `@ApiPropertyOptional()` 的别名

## 端点文档

### `@ApiBody(description?, definition?, contentType?)`
记录请求体模式。默认内容类型为 `application/json`。

```typescript
@Post('/users')
@ApiBody('User data', CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```
@ApiProperty 描述的所有定义格式（OpenAPI 模式、基本类型数组、类引用数组、记录、枚举...）对 @ApiBody 都有效。任何类的模式都会自动解析。

也可以仅使用类引用而不带描述来使用 @ApiBody（在这种情况下将是模式名称）。
```ts
@Post('/users')
@ApiBody(CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```

### `@ApiResponse(statusCode, description?, definition?)`
记录端点响应。

```typescript
@Get('/users')
@ApiResponse(200, 'Users', [UserDto])
getUsers() {}
```
@ApiProperty 描述的所有定义格式（OpenAPI 模式、基本类型数组、类引用数组、记录、枚举...）对 @ApiResponse 都有效。任何类的模式都会自动解析。

也可以仅使用类引用而不带描述来使用 @ApiResponse（在这种情况下将是模式名称）。
```typescript
@Get('/users/:id')
@ApiResponse(200, UserDto)
getUser(@Param('id') id: string) {}
```

### `@ApiOperation(summary, description?, tags?)`
描述端点操作。

```typescript
@Get('/users')
@ApiOperation('Get all users')
getUsers() {}

@Post('/users')
@ApiOperation('Create user', 'Creates a new user account', ['users'])
createUser() {}
```

### 参数文档
- `@ApiParam(name, description?, required?, definition?)` - 路径参数
- `@ApiQuery(name, description?, required?, definition?)` - 查询参数  
- `@ApiHeader(name, description?, required?, definition?)` - 请求头

支持 `@ApiProperty` 和之前装饰器描述的所有定义格式，但请注意，复杂用法（对象、数组、类引用等）根据装饰器的性质可能没有意义，即使 OpenAPI 模式会正确生成。

```typescript
@Get('/users/:id')
@ApiParam('id', 'User ID', true, Number)
@ApiQuery('include', 'Include related data', false, Boolean)
@ApiHeader('Authorization', 'Bearer token', true) // 默认为 String
getUser(
  @Param('id') id: number,
  @Query('include') include?: boolean
) {}
```

## 错误响应

### `@ApiErrorResponse(statusCode, description?, ErrorDataClass?)`
使用 YasuiJS 错误包装器格式记录错误响应。此装饰器会自动包含框架的完整错误模式结构，该结构包装应用程序中的所有错误。

```typescript
@Get('/users/:id')
@ApiErrorResponse(404, 'User not found')
@ApiErrorResponse(500, 'Internal server error')
getUser(@Param('id') id: string) {}
```

当您有扩展 `HttpError` 的自定义错误类时，可以使用 `@ApiProperty` 和 `@ApiPropertyOptional` 装饰器来增强它们，以记录其特定属性。生成的模式将把您的自定义错误数据与 YasuiJS 的标准错误包装器合并：

```typescript
@Post('/users')
@ApiErrorResponse(400, 'Validation failed', ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}

// 也可以仅使用类引用（描述将是模式名称）
@Post('/users')
@ApiErrorResponse(400, ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}
```

### 替代方法
如果您希望更简单的错误文档而不使用完整的包装器格式，可以继续使用前面描述的标准 `@ApiResponse` 装饰器。使用 `@ApiResponse` 时，如果您传递扩展 HttpError 的自定义错误类，您只会获得该特定类的模式，而不会继承任何 API 定义。

## 实用函数

### `resolveSchema(schema: ApiPropertyDefinition): OpenAPISchema`
手动将任何模式定义（参见 @ApiProperty 部分描述的格式）解析为 OpenAPI 格式。对特定用例很有用。

```typescript
import { resolveSchema } from 'yasui';
const schema = resolveSchema(CreateUserDto);
```