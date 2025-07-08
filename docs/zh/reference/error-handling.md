# 错误处理

YasuiJS 提供了自动错误处理和格式化功能，适用于日志记录和客户端响应。所有控制器方法都会自动包装错误处理逻辑，以捕获和处理任何抛出的错误。

## 概述

当应用程序中发生错误时，YasuiJS 会自动：
- 记录包含详细信息的错误日志（URL、方法、状态、消息）
- 将错误格式化并以 JSON 响应形式发送给客户端
- 包含 HTTP 状态码、错误详情、请求信息和任何额外的错误数据

```typescript
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.findById(id);
    
    if (!user) {
      // 这个错误将被自动捕获和格式化
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    return user;
  }
}
```

## 自定义错误处理

### HttpError 类

通过扩展或使用 `HttpError` 类创建具有特定状态码和附加数据的自定义错误。您的自定义错误必须设置 `status` 和 `message` 属性，并且可以包含任何其他属性。

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/users')
export class UserController {
 @Get('/:id')
 getUser(@Param('id') id: string) {
   const user = this.userService.findById(id);
   
   if (!user) {
     throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
   }
   
   return user;
 }
}
```

### 自定义错误类

为特定业务逻辑错误创建自定义错误类：

```typescript
class ValidationError extends HttpError {
  fields: string[];

  constructor(message: string, fields: string[]) {
    super(HttpCode.BAD_REQUEST, message);
    this.fields = fields;
  }
}

@Controller('/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    const missingFields = this.validateUserData(userData);
    
    if (missingFields.length > 0) {
      throw new ValidationError('Missing required fields', missingFields);
    }
    
    return this.userService.createUser(userData);
  }
}
```

## HttpCode 枚举

YasuiJS 提供了一个包含常见 HTTP 状态码的 `HttpCode` 枚举。有关 HTTP 状态码及其含义的完整列表，请参阅 [HTTP 响应状态码文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)。

```typescript
import { HttpCode } from 'yasui';

@Controller('/api')
export class ApiController {
  @Delete('/:id')
  deleteItem(@Param('id') id: string) {
    if (!this.service.exists(id)) {
      throw new HttpError(HttpCode.NOT_FOUND, 'Item not found');
    }
    
    this.service.delete(id);
  }
}
```

## 错误响应格式

当抛出错误时，YasuiJS 会自动将其格式化为一致的 JSON 响应：

```json
{
  "error": {
    "status": 404,
    "message": "User not found",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/users/123",
    "method": "GET",
    "data": {
      "resourceType": "User",
      "resourceId": "123"
    }
  }
}
```

响应包括：
- **status**：HTTP 状态码
- **message**：错误消息
- **timestamp**：错误发生时间
- **path**：发生错误的请求路径
- **method**：HTTP 方法
- **data**：来自自定义错误的任何附加属性

## 服务中的错误处理

服务可以抛出错误，这些错误在从控制器调用时会被自动捕获：

```typescript
@Injectable()
export class UserService {
  findById(id: string) {
    const user = this.database.findUser(id);
    
    if (!user) {
      // 这将被控制器的错误处理程序捕获
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    
    return user;
  }

  createUser(userData: any) {
    if (this.emailExists(userData.email)) {
      throw new HttpError(HttpCode.CONFLICT, 'Email already exists', {
        email: userData.email,
        suggestion: 'Try logging in instead'
      });
    }
    
    return this.database.createUser(userData);
  }
}
```

## 装饰器验证

YasuiJS 在启动时自动验证您的装饰器，以捕获常见的配置错误。这些错误在服务器初始化后报告，但不会阻止服务器运行：

```typescript
// 这将被检测并报告为错误
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // 检测到循环依赖！
}

// 缺少参数装饰器将被检测到
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(id: string) { // 缺少 @Param('id') 装饰器
    return this.userService.findById(id);
  }
}
```

您可以在配置中禁用装饰器验证（不推荐）：

```typescript
yasui.createServer({
  controllers: [UserController],
  enableDecoratorValidation: false // 不安全 - 禁用验证
});
```