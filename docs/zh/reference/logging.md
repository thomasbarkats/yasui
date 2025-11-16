# 日志服务

YasuiJS 包含一个内置的日志服务，具有计时功能和彩色编码输出。它为您的应用程序提供结构化日志记录，具有请求特定的上下文和性能监控。

日志记录器可以通过构造函数注入到服务和控制器中，或者使用 `@Logger()` 装饰器在方法参数中直接访问。

```typescript
import { Injectable, LoggerService } from 'yasui';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  getUser(id: string) {
    this.logger.log('获取用户', { userId: id });
    const user = this.findUser(id);
    this.logger.success('用户查找成功');
    return user;
  }
}
```

## 使用 LoggerService

### 构造函数注入

在您的服务或控制器构造函数中注入日志服务：

```typescript
@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  createUser(userData: any) {
    this.logger.log('创建新用户');
    // 业务逻辑在这里
    this.logger.success('用户创建成功');
  }
}

@Controller('/users')
export class UserController {
  constructor(private readonly logger: LoggerService) {}

  @Get('/')
  getUsers() {
    this.logger.log('获取所有用户');
    return this.userService.getAllUsers();
  }
}
```

### 请求级日志记录器

使用 `@Logger()` 装饰器获取一个**专用的每请求日志记录器实例**。每个请求都获得自己的隔离日志记录器，该日志记录器会自动启动以进行计时跟踪。日志记录器在请求开始时启动。

```typescript
import { LoggerService } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Logger() logger: LoggerService) {
    logger.log('处理用户列表请求');
    // 日志记录器已经启动，计时是自动的
    const users = this.fetchUsers();
    logger.success(`找到 ${users.length} 个用户`);
    return users;
  }
}

@Middleware()
export class RequestLoggerMiddleware {
  use(
    @Req() req: Request,
    @Logger() logger: LoggerService
  ) {
    logger.log('传入请求', { method: req.method, path: req.path });
  }
}
```

仅在使用 `@Logger` 装饰器时才会为每个请求创建日志记录器实例。日志记录器无法通过 `req.logger` 访问 - 使用 `@Logger()` 装饰器访问它。这通过仅在明确需要时创建日志记录器实例来确保最佳性能。

**构造函数日志记录器 vs 请求级日志记录器：**

```typescript
@Controller('/api/users')
export class UserController {
  // 构造函数注入：在所有请求间共享
  // 使用 `@Scope(Scopes.LOCAL)` 获取控制器范围的实例
  constructor(private readonly logger: LoggerService) {}

  @Get('/shared')
  withSharedLogger() {
    // 使用共享日志记录器（默认单例）
    this.logger.log('使用共享日志记录器');
  }

  @Get('/isolated')
  withRequestLogger(@Logger() logger: LoggerService) {
    // 使用专用请求日志记录器（每请求唯一）
    logger.log('使用请求特定日志记录器');
    // 自动跟踪从请求开始以来的计时
  }
}
```

## 日志记录方法

LoggerService 为不同的日志级别提供了几种方法：

```typescript
@Injectable()
export class ExampleService {
  constructor(private logger: LoggerService) {}

  demonstrateLogs() {
    // 一般信息
    this.logger.log('应用程序已启动');
    // 调试信息（详细）
    this.logger.debug('调试信息', { details: '额外数据' });
    // 成功消息
    this.logger.success('操作成功完成');
    // 警告消息
    this.logger.warn('警告：使用了已弃用的方法');
    // 错误消息
    this.logger.error('发生错误', { error: '详细信息' });
  }
}
```

## 计时功能

日志记录器包含用于性能监控的内置计时功能：

```typescript
@Injectable()
export class DataService {
  constructor(private logger: LoggerService) {}

  processData() {
    this.logger.start(); // 启动计时器
    
    const data = this.fetchData();
    const elapsed = this.logger.stop(); // 停止并获取经过的时间
    this.logger.log(`处理在 ${elapsed}ms 内完成`);
    
    return data;
  }

  batchProcess(items: any[]) {
    this.logger.start();
    
    for (const item of items) {
      this.processItem(item);
      this.logger.reset(); // 为下一个项目重置计时器
    }
    
    // 获取当前经过的时间而不停止
    const currentTime = this.logger.getTime();
    this.logger.debug(`当前处理时间：${currentTime}ms`);
  }
}
```

## 调试模式集成

当在您的 YasuiJS 配置中启用调试模式时，日志记录器提供更详细的输出：

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true // 启用详细日志记录
});
```

**何时使用哪个：**
- **构造函数注入** - 用于一般日志记录，在控制器方法间共享状态
- **`@Logger()` 装饰器** - 用于请求特定的日志记录，带有自动计时跟踪

在调试模式下：
- 所有传入请求都会自动记录
- 显示调试消息
- 显示更详细的错误信息