# 中间件

中间件在请求到达控制器之前在管道中处理请求。它们处理横切关注点，如身份验证、日志记录、验证和请求转换。

## 概述

YasuiJS 支持两种类型的中间件，两者都基于 Web 标准构建，并与所有运行时（Node.js、Deno、Bun）兼容：

1. **基于类的中间件** - 使用 `@Middleware()` 装饰器，支持依赖注入
2. **函数式中间件** - 遵循 Web 标准 `Request → Response` 模式的简单函数

**重要提示**：YasuiJS 4.x 使用 Web 标准 Request/Response 而不是 Express。Express 风格的中间件（如 `cors`、`helmet` 等）**不兼容**。请使用与 Web 标准兼容的替代方案或编写原生 YasuiJS 中间件。

中间件可以在三个级别应用，具有不同的执行优先级：
1. **应用程序级别** - 应用于所有请求
2. **控制器级别** - 应用于控制器中的所有路由
3. **端点级别** - 应用于特定路由

```typescript
import { Middleware } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use() {
    console.log('Request received');
  }
}
```

## 函数式中间件

函数式中间件是遵循 Web 标准 `Request → Response` 模式的简单函数。它们非常适合第三方集成、无状态操作或不需要依赖注入的场景。

```typescript
import type { YasuiRequest, RequestHandler, NextFunction } from 'yasui';

export function simpleLogger(): RequestHandler {
  return async (req: YasuiRequest, next?: NextFunction): Promise<Response> => {
    console.log(`${req.method} ${req.path}`);
    return next ? next() : new Response(null, { status: 500 });
  };
}

// 使用方式
yasui.createServer({
  middlewares: [simpleLogger()],
  controllers: [UserController]
});
```

**第三方兼容性：** 函数式中间件可与任何提供 Web 标准处理程序的库配合使用，例如身份验证库（如 BetterAuth 的 `auth.handler()`）、官方插件或自定义 fetch 兼容处理程序。

**何时使用：**
- 第三方集成（BetterAuth 等）
- 无状态操作（日志记录、CORS、速率限制）
- 不需要依赖注入

**何时使用类：**
- 需要依赖注入（`@Inject()`）
- 访问服务/数据库
- 具有共享状态的复杂业务逻辑

## 基于类的中间件

### 中间件装饰器

`@Middleware()` 装饰器将类标记为中间件。该类必须实现 `use()` 方法。您可以选择实现 YasuiJS 提供的 `IMiddleware` 接口来强制执行方法签名。

```typescript
import { Middleware, IMiddleware, Request, Req } from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(@Req() req: Request) {
    const token = req.rawHeaders.get('authorization');

    if (!token) {
      throw new HttpError(401, 'Unauthorized');
    }
    // 在此处验证令牌逻辑

    // 如果返回 nothing/void，将继续到下一个中间件或控制器
  }
}
```

**注意：** 中间件的工作方式类似于控制器方法 - 您可以返回值、抛出错误或不返回任何内容以继续执行。如果您需要手动控制执行流程，使用 `@Next()` 是可选的。

### 中间件中的参数装饰器

中间件可以使用与控制器相同的参数装饰器，并且也受益于自动错误捕获：

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new HttpError(400, 'Invalid request data');
    }
  }

  private isValid(data: any): boolean {
    // 验证逻辑
    return true;
  }
}
```

**自动类型转换：** 中间件中的所有参数装饰器都受益于与控制器相同的自动类型转换。参数在中间件执行之前会转换为其指定的类型。

### 依赖注入

由于中间件类的行为类似于控制器，它们也允许以相同的方式进行依赖注入：

```typescript
@Middleware()
export class LoggingMiddleware {
  constructor (
    private validationService: ValidationService, // 标准注入
    @Inject('CONFIG') private config: AppConfig, // 预注册的自定义注入
  ) {}

  use(
    @Body() body: any,
    @Inject() anotherService: AnotherService, // 在方法级别相同
  ) {
    if (!this.validationService.isValid(body)) {
      throw new HttpError(400, 'Invalid request data');
    }
  }
}
```

## 编写自定义中间件

您可以为常见用例创建中间件。以下是两种模式：

### 模式 1：简单验证（不需要 @Next()）

```typescript
@Middleware()
export class ApiKeyMiddleware implements IMiddleware {
  use(@Header('x-api-key') apiKey: string) {
    if (!apiKey || apiKey !== 'expected-key') {
      throw new HttpError(401, 'Invalid API key');
    }
    // 将自动继续
  }
}
```

### 模式 2：响应修改（使用 @Next()）

当您需要修改响应时，使用 `@Next()`：

```typescript
@Middleware()
export class TimingMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const start = Date.now();
    const response = await next();
    const duration = Date.now() - start;

    const headers = new Headers(response.headers);
    headers.set('X-Response-Time', `${duration}ms`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
}
```

**对于生产环境的 CORS 处理**，请使用官方插件 [`@yasui/cors`](/zh/plugins/cors)，它提供源验证、预检请求处理、凭据支持和现代安全功能。

## 中间件使用级别

### 应用程序级别

应用于整个应用程序的所有请求：

```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, SecurityMiddleware]
});
```

### 控制器级别

应用于特定控制器内的所有路由：

```typescript
// 单个中间件
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // 所有路由都需要身份验证
}

// 多个中间件
@Controller('/api/admin', AuthMiddleware, ValidationMiddleware)
export class AdminController {
  // 所有路由都有身份验证 + 验证
}
```

### 端点级别

仅应用于特定路由：

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // 无中间件
  }
  
  @Post('/', ValidationMiddleware)
  createUser() {
    // 仅验证中间件
  }
  
  @Delete('/:id', AuthMiddleware, ValidationMiddleware)
  deleteUser() {
    // 身份验证和验证中间件
  }
}
```

## 执行顺序

中间件按以下顺序执行：

1. **应用程序中间件**（按注册顺序）
2. **控制器中间件**（按声明顺序）
3. **端点中间件**（按声明顺序）
4. **控制器方法**

```typescript
// 执行顺序示例：
yasui.createServer({
  middlewares: [GlobalMiddleware] // 1. 第一个
});

@Controller('/users', ControllerMiddleware) // 2. 第二个
export class UserController {
  @Post('/', EndpointMiddleware) // 3. 第三个
  createUser() {
    // 4. 最后是控制器方法
  }
}
```