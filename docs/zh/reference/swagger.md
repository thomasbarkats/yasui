# API文档（Swagger）

YasuiJS提供OpenAPI文档生成功能，可选集成Swagger UI。它会自动从现有的装饰器生成文档，并允许你通过额外的元数据来增强它。

## 配置

### 基本设置

通过在应用中添加配置来启用Swagger。YasuiJS从你的控制器、路由和装饰器生成文档。

**注意**：你需要单独安装`swagger-ui-express`：
```bash
npm install swagger-ui-express
```

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

如果未指定自定义路径，文档默认可在`/api-docs`访问，JSON规范在`/<path>/swagger.json`。

即使没有任何Swagger特定的装饰器，YasuiJS也会自动从你现有的控制器和路由装饰器生成基本文档。框架会检测：
- **参数**：路径参数、查询参数和请求头会被自动检测，默认类型为`string`
- **请求体**：当存在时自动检测，默认schema为`{}`
- **响应**：仅检测200状态码（或如果存在`@HttpStatus`则为默认状态），不含schema信息

以下部分描述如何通过额外的元数据和精确类型增强此文档。

### 完整配置

支持所有标准OpenAPI 3.0规范属性，且都是可选的。框架会根据你的装饰器自动处理`openapi`、`paths`和`components`的生成。

<details>
<summary>查看包含所有配置选项的完整示例</summary>

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    // OpenAPI Info对象
    info: {
      title: '用户管理API',
      version: '2.1.0',
      description: '完整的用户管理操作API',
      termsOfService: 'https://example.com/terms',
      contact: {
        name: 'API支持',
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
      description: '在此处查找更多信息',
      url: 'https://example.com/docs'
    },
    // 服务器信息
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: '生产服务器',
        variables: {
          version: {
            default: 'v1',
            enum: ['v1', 'v2'],
            description: 'API版本'
          }
        }
      },
      {
        url: 'https://staging.example.com/v1',
        description: '预发布服务器'
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
        description: '用户管理操作',
        externalDocs: {
          description: '了解更多',
          url: 'https://example.com/docs/users'
        }
      }
    ]
  }
});
```

</details>

## Schema定义

YasuiJS使用带有属性装饰器的TypeScript类来定义API schema。当装饰器不带参数使用时，属性会自动从TypeScript元数据中推断。

如果在任何装饰器中使用了Schema，它们会被自动注册。

### `@ApiProperty(definition?)`
定义一个属性，默认必需。支持多种定义格式：

```typescript
export class CreateUserDto {
  @ApiProperty() // 从TypeScript推断类型
  name: string;

  @ApiProperty([String]) // 基本类型数组
  tags: string[];

  @ApiProperty(AddressDto) // 引用另一个类
  address: AddressDto;

  @ApiProperty([AddressDto]) // 类引用数组
  previousAddresses: AddressDto[];

  @ApiProperty({ enum: ['admin', 'user'] }) // 枚举值
  role: string;

  @ApiProperty({ enum: UserStatus }) // TypeScript枚举
  status: UserStatus;

  // OpenAPI schema，完全自定义
  @ApiProperty({ type: 'string', format: 'email' }) 
  username: string;

  @ApiProperty({
    theme: String,
    preferences: PreferencesDto,
    categories: [String],
    addresses: [AddressDto]
  }) // 前面列出用法的记录
  settings: any;
}
```

只有基本类型可以从TypeScript元数据推断。复杂类型（包括数组）将默认为`{ type: 'object' }`。对于特定类型，请使用上面显示的显式定义格式。

### `@ApiPropertyOptional(definition?)`
等同于`@ApiProperty({ required: false })`

```typescript
@ApiPropertyOptional()
description?: string;

@ApiPropertyOptional({ enum: ['small', 'medium', 'large'] })
size?: string;
```

### `@ApiSchema(name)`
定义自定义schema名称。默认名称是类名。Schema名称必须唯一。

```typescript
@ApiSchema('创建用户请求')
export class CreateUserDto {
  @ApiProperty()
  name: string;
}
```

### 别名
- `@AP()` - `@ApiProperty()`的别名
- `@APO()` - `@ApiPropertyOptional()`的别名

## 端点文档

### `@ApiBody(description?, definition?, contentType?)`
记录请求体schema。默认内容类型是`application/json`。

```typescript
@Post('/users')
@ApiBody('用户数据', CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```
@ApiProperty描述的所有定义格式（OpenAPI schema、基本类型数组、类引用数组、记录、枚举...）对@ApiBody都有效。任何类的Schema都会被自动解析。

也可以只使用类引用而不带描述（在这种情况下将使用schema名称）。
```ts
@Post('/users')
@ApiBody(CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```

### `@ApiResponse(statusCode, description?, definition?)`
记录端点响应。

```typescript
@Get('/users')
@ApiResponse(200, '用户列表', [UserDto])
getUsers() {}
```
@ApiProperty描述的所有定义格式（OpenAPI schema、基本类型数组、类引用数组、记录、枚举...）对@ApiResponse都有效。任何类的Schema都会被自动解析。

也可以只使用类引用而不带描述（在这种情况下将使用schema名称）。
```typescript
@Get('/users/:id')
@ApiResponse(200, UserDto)
getUser(@Param('id') id: string) {}
```

### `@ApiOperation(summary, description?, tags?)`
描述端点操作。

```typescript
@Get('/users')
@ApiOperation('获取所有用户')
getUsers() {}

@Post('/users')
@ApiOperation('创建用户', '创建新用户账户', ['users'])
createUser() {}
```

### 参数文档
- `@ApiParam(name, description?, required?, definition?)` - 路径参数
- `@ApiQuery(name, description?, required?, definition?)` - 查询参数
- `@ApiHeader(name, description?, required?, definition?)` - 请求头

支持为`@ApiProperty`和前面装饰器描述的所有定义格式，但要注意，复杂用法（对象、数组、类引用等）可能根据装饰器的性质不太合适，即使OpenAPI schema会被正确生成。

```typescript
@Get('/users/:id')
@ApiParam('id', '用户ID', true, Number)
@ApiQuery('include', '包含相关数据', false, Boolean)
@ApiHeader('Authorization', 'Bearer令牌', true) // 默认为String
getUser(
  @Param('id') id: number,
  @Query('include') include?: boolean
) {}
```

## 错误响应

### `@ApiErrorResponse(statusCode, description?, ErrorDataClass?)`
使用YasuiJS错误包装格式记录错误响应。此装饰器自动包含框架的完整错误schema结构，该结构包装了应用程序中的所有错误。

```typescript
@Get('/users/:id')
@ApiErrorResponse(404, '未找到用户')
@ApiErrorResponse(500, '内部服务器错误')
getUser(@Param('id') id: string) {}
```

当你有扩展`HttpError`的自定义错误类时，可以使用`@ApiProperty`和`@ApiPropertyOptional`装饰器来记录它们的特定属性。生成的schema将把你的自定义错误数据与YasuiJS的标准错误包装合并：

```typescript
@Post('/users')
@ApiErrorResponse(400, '验证失败', ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}

// 也可以只使用类引用（描述将是schema名称）
@Post('/users')
@ApiErrorResponse(400, ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}
```

### 替代方法
如果你更喜欢不带完整包装格式的简单错误文档，可以继续使用前面描述的标准`@ApiResponse`装饰器。使用`@ApiResponse`时，如果传递扩展HttpError的自定义错误类，你将只获得该特定类的schema，而不会继承任何API定义。

## 实用函数

### `resolveSchema(schema: ApiPropertyDefinition): OpenAPISchema`
手动将任何schema定义（参见@ApiProperty部分描述的格式）解析为OpenAPI格式。用于特定用例。

```typescript
import { resolveSchema } from 'yasui';
const schema = resolveSchema(CreateUserDto);
```
