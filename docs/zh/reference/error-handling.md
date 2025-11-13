# 错误处理

YasuiJS 为日志记录和客户端响应提供自动错误处理和格式化。所有控制器方法都会自动包装错误处理以捕获和处理任何抛出的错误。

## 概述

当应用程序中发生错误时，YasuiJS 会自动：
- 记录带有详细信息的错误（URL、方法、状态、消息）
- 将其格式化并作为 JSON 响应发送给客户端
- 包含 HTTP 状态码、错误详情、请求信息和任何额外的错误数据

```typescript
@Get('/:id')
getUser(@Param('id') id: string) {
  const user = this.userService.findById(id);

  if (!user) {
    // 这个错误将被自动捕获和格式化
    throw new Error('User not found');
  }
  return user;
}
```

## 自定义错误处理

### HttpError 类

如果你抛出一个 `Error`，默认的 HTTP 状态码将是 500（内部服务器错误）。要指定与你的错误相对应的预期 HTTP 返回状态，请抛出 `HttpError`：

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/users')
export class UserController {

 @Get('/:id')
 getUser(@Param('id') id: string) {
   const user = this.userService.findById(id);

   if (!user) {
     throw new HttpError(HttpCode.NOT_FOUND, `User ${id} not found`);
   }
   return user;
 }
}
```

你可以指定一个数字代码（如 400）或使用示例中提供的枚举 `HttpCode`。有关 HTTP 状态码及其含义的完整列表，请参阅 [HTTP 响应状态码文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)。

### 自定义错误类

通过扩展或使用 `HttpError` 类创建具有特定状态码和附加数据的自定义错误。你的自定义错误必须通过调用父构造函数来设置 `status` 和 `message` 属性，并可以包含任何其他属性。

```typescript
class ValidationError extends HttpError {
  fields: string[];

  constructor(fields: string[]) {
    super(HttpCode.BAD_REQUEST, 'Missing required fields');
    this.fields = fields;
  }
}

@Controller('/users')
export class UserController {

  @Post('/')
  createUser(@Body() userData: any) {
    const missingFields = this.validateUserData(userData);

    if (missingFields.length > 0) {
      throw new ValidationError(missingFields);
    }
    return this.userService.createUser(userData);
  }
}
```
附加属性将包含在 Yasui 的格式化响应中。

## 错误响应格式

当抛出错误时，YasuiJS 会自动将其格式化为一致的 JSON 响应：

```json
{
  "url": "http://localhost:3000/api/users/123",
  "path": "/api/users/123",
  "method": "POST",
  "name": "ValidationError", // 错误类名
  "message": "Missing required fields",
  "statusMessage": "Bad Request", // HTTP 状态消息
  "status": 404, // HTTP 状态码
  "data": {
    "fields": ["name", "age"]
  }
}
```

继承自 HttpError 的自定义错误的属性将包含在 `data` 中。

## 服务中的错误处理

服务或任何 Injectable 可以抛出错误，这些错误在从控制器调用时会被自动捕获：

```typescript
@Injectable()
export class UserService {

  findById(id: string) {
    const user = this.database.findUser(id);
    if (!user) {
      // 这将被控制器的错误处理器捕获
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    return user;
  }
}
```

## 错误日志

意外错误（任何未捕获的非 HttpError 错误）会被记录到控制台。HttpError 实例不会被记录，因为它们代表具有预期状态码的有意业务错误，并被格式化并作为 JSON 响应返回。

## 装饰器验证

YasuiJS 在启动时自动验证你的装饰器以捕获常见的配置错误。这些错误在服务器初始化后报告，但不会停止服务器运行：

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

// 将检测到缺少参数装饰器
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(id: string) { // 缺少 @Param('id') 装饰器
    return this.userService.findById(id);
  }
}
```

你可以在配置中禁用装饰器验证（不推荐）：

```typescript
yasui.createServer({
  controllers: [UserController],
  enableDecoratorValidation: false // 不安全 - 禁用验证
});
```
