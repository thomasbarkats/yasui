# 日志服务

YasuiJS 包含内置的日志服务，具有计时功能和彩色编码输出。它为您的应用程序提供结构化日志记录，包含请求特定上下文和性能监控。

日志记录器可以通过构造函数注入到服务和控制器中，或者使用 `@Logger()` 装饰器直接在方法参数中访问。

```typescript
import { Injectable, LoggerService } from 'yasui';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  getUser(id: string) {
    this.logger.log('获取用户', { userId: id });
    const user = this.findUser(id);
    this.logger.success('用户成功找到');
    return user;
  }
}
```

## 使用 LoggerService

### 构造函数注入

在服务或控制器构造函数中注入日志服务：

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

### 方法级访问

- `@Logger()` - 获取请求特定的日志记录器实例（无参数）

使用 `@Logger()` 装饰器获取专用的日志记录器实例，该实例在路由开始时自动启动。这对于在调试模式下跟踪整个操作的时间非常有用。这在控制器方法和中间件方法中都可以使用。

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
    @Logger() logger: LoggerService,
    @Next() next: NextFunction
  ) {
    logger.log('收到请求', { method: req.method, path: req.path });
    next();
  }
}
```

## 日志方法

LoggerService 提供了几种不同日志级别的方法：

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
    this.logger.error('发生错误', { error: '详情' });
  }
}
```

## 计时功能

日志记录器包含内置的计时功能，用于性能监控：

```typescript
@Injectable()
export class DataService {
  constructor(private logger: LoggerService) {}

  processData() {
    this.logger.start(); // 开始计时
    
    const data = this.fetchData();
    const elapsed = this.logger.stop(); // 停止并获取经过的时间
    this.logger.log(`处理完成，耗时 ${elapsed}ms`);
    
    return data;
  }

  batchProcess(items: any[]) {
    this.logger.start();
    
    for (const item of items) {
      this.processItem(item);
      this.logger.reset(); // 为下一个项目重置计时器
    }
    
    // 获取当前经过的时间，不停止计时
    const currentTime = this.logger.getTime();
    this.logger.debug(`当前处理时间：${currentTime}ms`);
  }
}
```

## 调试模式集成

当在 YasuiJS 配置中启用调试模式时，日志记录器提供更详细的输出：

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true // 启用详细日志记录
});
```

在调试模式下：
- 所有传入的请求都会自动记录
- 显示调试消息
- 显示更详细的错误信息