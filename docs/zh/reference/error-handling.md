# 错误处理

YasuiJS 为日志记录和客户端响应提供自动错误处理和格式化。所有控制器方法都自动包含错误处理，以捕获和处理任何抛出的错误。

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

通过扩展或使用 `HttpError` 类创建具有特定状态码和额外数据的自定义错误。您的自定义错误必须设置 `status` 和 `message` 属性，并可以包含任何其他属性。

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/users')
export class UserController {

 @Get('/:id')
 getUser(@Param('id') id: string) {
   const user = this.userService.findById(id);

   if (!user) {
     throw new HttpError(HttpCode.NOT_FOUND, '未找到用户');
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

  constructor(fields: string[]) {
    super(HttpCode.BAD_REQUEST, '缺少必填字段');
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

## HttpCode 枚举

YasuiJS 提供了一个包含常用 HTTP 状态码的 `HttpCode` 枚举。有关 HTTP 状态码及其含义的完整列表，请参阅 [HTTP 响应状态码文档](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)。

## 错误响应格式

当抛出错误时，YasuiJS 会自动将其格式化为一致的 JSON 响应：

```json
{
  "url": "http://localhost:3000/api/users/123",
  "path": "/api/users/123",
  "method": "POST",
  "name": "ValidationError", // 错误类名
  "message": "缺少必填字段",
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
      throw new HttpError(HttpCode.NOT_FOUND, '未找到用户');
    }
    return user;
  }
}
```

## 装饰器验证

YasuiJS 在启动时自动验证您的装饰器，以捕获常见的配置错误。这些错误在服务器初始化后报告，但不会停止服务器运行：

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

您可以在配置中禁用装饰器验证（不推荐）：

```typescript
yasui.createServer({
  controllers: [UserController],
  enableDecoratorValidation: false // 不安全 - 禁用验证
});
```