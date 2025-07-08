# API 文档（Swagger）

YasuiJS 提供 OpenAPI 文档生成功能，可选集成 Swagger UI。它会自动从现有的装饰器生成文档，并允许您通过额外的元数据来增强文档。

## 配置

### 基本设置

通过在应用程序中添加配置来启用 Swagger。YasuiJS 会自动从您的控制器、路由和装饰器生成文档。

**注意**：您需要单独安装 `swagger-ui-express`：
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

文档将可在 `/api-docs`（默认路径）访问，JSON 规范在 `/api-docs.json` 访问。

### 完整配置

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    path: '/docs', // 自定义路径
    info: {
      title: '用户管理 API',
      version: '2.1.0',
      description: '用户管理操作的完整 API',
      contact: {
        name: 'API 支持',
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
        description: '生产服务器'
      },
      {
        url: 'http://localhost:3000',
        description: '开发服务器'
      }
    ]
  }
});
```

## 增强文档

使用可选装饰器丰富默认 API 文档。所有装饰器都附加到端点的方法上：

### API 操作

- `@ApiOperation(summary, description?, tags?)` - 描述端点

```typescript
import { ApiOperation } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/')
  @ApiOperation('获取所有用户', '检索系统中所有用户的列表', ['users'])
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/')
  @ApiOperation('创建用户', '创建新用户账户')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### 参数文档

- `@ApiParam(name, description?, required?, schema?)` - 记录路径参数
- `@ApiQuery(name, description?, required?, schema?)` - 记录查询参数  
- `@ApiHeader(name, description?, required?, schema?)` - 记录头部

```typescript
import { ApiParam, ApiQuery, ApiHeader } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiParam('id', '用户唯一标识符', true, { type: 'string' })
  @ApiHeader('Authorization', '用于认证的Bearer令牌', true)
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('/')
  @ApiQuery('page', '分页的页码', false, { type: 'number', default: 1 })
  @ApiQuery('limit', '每页项目数', false, { type: 'number', default: 10 })
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getUsers({ page, limit });
  }
}
```

### 请求体文档

- `@ApiBody(description?, schema?)` - 记录请求体

```typescript
import { ApiBody } from 'yasui';

@Controller('/users')
export class UserController {
  @Post('/')
  @ApiBody('用户创建数据', {
    type: 'object',
    properties: {
      name: { type: 'string', description: '用户全名' },
      email: { type: 'string', format: 'email', description: '用户电子邮件地址' },
      age: { type: 'number', minimum: 18, description: '用户年龄（必须18+）' }
    },
    required: ['name', 'email']
  })
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### 响应文档

- `@ApiResponse(statusCode, description, schema?)` - 记录响应

```typescript
import { ApiResponse } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiResponse(200, '成功找到用户', {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  })
  @ApiResponse(404, '未找到用户')
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  @ApiResponse(201, '用户创建成功')
  @ApiResponse(400, '无效的用户数据')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

## 错误响应

`ErrorResourceSchema` 为 YasuiJS 的错误包装格式生成模式。您可以选择为自定义错误定义将包含在 `data` 属性中的其他字段：

```typescript
import { ApiResponse, ErrorResourceSchema } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiResponse(404, '未找到用户', ErrorResourceSchema())
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  @ApiResponse(400, '验证失败', ErrorResourceSchema({
    fields: { 
      type: 'array', 
      items: { type: 'string' },
      description: '无效字段列表' 
    }
  }, {
    fields: ['email', 'password']
  }))
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```