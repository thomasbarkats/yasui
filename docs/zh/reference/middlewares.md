# 中间件

中间件在请求到达控制器之前以管道方式处理请求。它们处理诸如身份验证、日志记录、验证和请求转换等横切关注点。

## 概述

YasuiJS 支持两种类型的中间件：
- **基于类的中间件**，使用 `@Middleware()` 装饰器
- **Express RequestHandler 函数**，用于与现有 Express 中间件兼容

中间件可以在三个级别应用，具有不同的执行优先级：
1. **应用程序级别** - 应用于所有请求
2. **控制器级别** - 应用于控制器中的所有路由
3. **端点级别** - 应用于特定路由

```typescript
import { Middleware, NextFunction } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use(@Next() next: NextFunction) {
    console.log('Request received');
    next();
  }
}
```

## 基于类的中间件

### 中间件装饰器

- `@Middleware()` - 将类标记为中间件（无参数）

`@Middleware()` 装饰器将类定义为中间件。该类必须实现 `use()` 方法。您可以选择实现 YasuiJS 提供的 `IMiddleware` 接口来强制执行方法签名。

```typescript
import {
  Middleware, IMiddleware,
  Request, Response, NextFunction,
  Req, Res, Next,
} from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // 在此处验证令牌逻辑

    next(); // 继续执行下一个中间件或控制器逻辑
  }
}
```

### 中间件中的参数装饰器

中间件可以使用与控制器相同的参数装饰器：

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string,
    @Next() next: NextFunction
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new Error('Invalid request data');
    }
    
    next();
  }
  
  private isValid(data: any): boolean {
    // 验证逻辑
    return true;
  }
}
```

### 中间件执行

您必须显式调用 `next()` 以继续执行下一个中间件或控制器。要停止请求管道，可以：
- 使用 `@Res()` 返回响应
- 抛出错误
- 不调用 `next()`

```typescript
@Middleware()
export class ConditionalMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    if (req.path === '/public') {
      next(); // 继续管道
    }
    // 不调用 next() 以在此处停止
  }
}
```

## Express RequestHandler 中间件

您可以直接使用标准的 Express 中间件函数：

```typescript
import cors from 'cors';
import helmet from 'helmet';

yasui.createServer({
  middlewares: [
    cors(),
    helmet(),
  ]
});
```

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

应用于特定控制器中的所有路由：

```typescript
// 单个中间件
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // 所有路由都需要身份验证
}

// 多个中间件
@Controller('/api/admin', AuthMiddleware, ValidationMiddleware)
export class AdminController {
  // 所有路由都有身份验证和验证
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
    // 同时使用身份验证和验证中间件
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
  middlewares: [GlobalMiddleware] // 1. 首先
});

@Controller('/users', ControllerMiddleware) // 2. 其次
export class UserController {
  @Post('/', EndpointMiddleware) // 3. 第三
  createUser() {
    // 4. 最后是控制器方法
  }
}
```