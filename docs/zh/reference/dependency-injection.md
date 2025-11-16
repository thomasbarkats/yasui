# 依赖注入

YasuiJS 提供了一个完整的依赖注入系统，具有自动解析依赖关系和作用域管理功能。它实现了松耦合、更好的可测试性和更清晰的关注点分离。

## 概述

依赖注入自动管理组件之间的关系。YasuiJS 通过分析类构造函数和方法参数来自动创建和连接对象，而不是手动创建和连接对象。

```typescript
import { Injectable, Controller } from 'yasui';

@Injectable()
export class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

@Controller('/users')
export class UserController {
  // UserService 被自动创建和注入
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

## 可注入服务

### Injectable 装饰器

- `@Injectable()` - 将类标记为可注入（无参数，所有服务都需要）

使用 `@Injectable()` 装饰器将类标记为可注入。此装饰器对所有将被注入的服务来说都是**必需的**。

```typescript
import { Injectable } from 'yasui';

@Injectable()
export class UserService {
  getUser(id: string) {
    // 业务逻辑
    return { id, name: 'John Doe' };
  }
}

@Injectable()
export class EmailService {
  sendEmail(to: string, subject: string) {
    // 邮件逻辑
    console.log(`Sending email to ${to}: ${subject}`);
  }
}
```

## 构造函数注入

只需在控制器、中间件或服务构造函数中声明依赖项。您可以在同一个构造函数中注入多个服务。它们将被自动解析和注入：

```typescript
@Injectable()
export class OrderService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private paymentService: PaymentService
  ) {}

  processOrder(orderData: any) {
    const user = this.userService.getUser(orderData.userId);
    const payment = this.paymentService.processPayment(orderData.amount);
    this.emailService.sendEmail(user.email, 'Order confirmed');
    
    return { order: orderData, payment };
  }
}
```

## 依赖作用域

### Scope 装饰器

- `@Scope(scope)` - 指定依赖作用域（需要作用域参数）

YasuiJS 支持三种不同的依赖作用域，用于控制实例的创建和共享方式：

- **`Scopes.SHARED`**（默认）：在整个应用程序中共享的单例实例
- **`Scopes.LOCAL`**：为每个注入上下文创建新实例
- **`Scopes.DEEP_LOCAL`**：创建新实例，并将局部性传播到其自身的依赖项

`@Scope()` 装饰器应用于注入点，而不是服务类本身。

### 构造函数级作用域

您可以在构造函数中为单个依赖项指定作用域：

```typescript
@Injectable()
export class MyService {
  constructor(
    @Scope(Scopes.LOCAL) private tempService: TempService,
    @Scope(Scopes.DEEP_LOCAL) private isolatedService: IsolatedService,
    private sharedService: SharedService // 默认为 SHARED
  ) {}
}
```

### 作用域选择指南

- **SHARED**：用于无状态服务、缓存、数据库连接
- **LOCAL**：用于请求特定的服务、临时处理器
- **DEEP_LOCAL**：用于完全隔离的操作、测试场景

## 方法级注入

### Inject 装饰器

- `@Inject(token?)` - 将依赖项注入到方法参数中（可选的自定义令牌）

您可以直接将依赖项注入到控制器或中间件方法参数中。这将注入限制在特定端点而不是整个控制器，允许细粒度的作用域管理。例如，您可以在构造函数中注入共享服务，但特定路由需要同一服务的专用实例。

```typescript
@Controller('/users')
export class UserController {

  // 控制器的共享实例
  constructor(private userService: UserService) {}

  @Get('/:id')
  getUser(
    @Param('id') id: string,
    @Inject() userService: UserService // 此端点的特定实例
  ) {
    return userService.getUser(id);
  }
}
```

### 方法级作用域

作用域也适用于方法级注入：

```typescript
@Controller('/api')
export class ApiController {
  @Get('/data')
  getData(
    @Inject() @Scope(Scopes.LOCAL) tempService: TempService,
    @Inject() @Scope(Scopes.SHARED) cacheService: CacheService
  ) {
    return tempService.processData(cacheService.getData());
  }
}
```

## 自定义注入令牌

### 使用自定义令牌

对于复杂场景，使用带有 `@Inject()` 的自定义注入令牌。这对于注入原始值、配置或当您需要同一个类的多个实例时很有用：

```typescript
@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_URL') private dbUrl: string,
    @Inject('CONFIG') private config: AppConfig
  ) {
    console.log(`Connecting to: ${this.dbUrl}`);
  }
}

@Controller('/users')
export class UserController {
  @Get('/')
  getUsers(
    @Inject('API_VERSION') apiVersion: string,
    @Inject() userService: UserService
  ) {
    return {
      version: apiVersion,
      users: userService.getAllUsers()
    };
  }
}
```

### 注册自定义令牌

在应用程序配置中注册自定义令牌，使用 `provide` 提供直接值或使用 `factory` 提供计算值：

```typescript
yasui.createServer({
  controllers: [UserController],
  injections: [
    // 直接值
    { token: 'CONFIG', provide: 'value' },
    // 异步工厂函数
    {
      token: 'DATABASE',
      factory: async () => {
        const db = new Database();
        await db.connect();
        return db;
      }
    }
  ]
});
```

默认情况下，所有工厂注入都会在服务器启动前解析。

### 延迟异步注入 {#deferred-deps}

对于不应阻塞服务器启动且接受其暂时缺失或错误的依赖项，使用 `deferred: true`。服务器立即启动，同时依赖项在后台初始化。

**工作原理：**

- 服务器立即启动（非阻塞）
- 服务在工厂函数解析前为 `null`
- **开发者处理 null 状态**（返回 503、跳过操作、使用后备方案等）
- 初始化后，服务正常工作
- 如果初始化失败，服务保持 `null`

<details>
<summary>点击查看完整示例</summary>

```typescript
import { Inject, HttpError } from 'yasui';

yasui.createServer({
  controllers: [AnalyticsController],
  injections: [{
    token: 'ANALYTICS',
    deferred: true,
    factory: async () => {
      try {
        const analytics = new AnalyticsClient();
        await analytics.connect();
        return analytics;
      } catch (err) {
        // 做一些事情，比如发送警报。
        throw err; // 服务将保持 null
      }
    },
  }]
});

export class AnalyticsController {
  // YasuiJS 会强制你使用 null 联合类型
  constructor(
    @Inject('ANALYTICS') private analytics: AnalyticsService | null
  ) { }

  @Get('/events')
  getEvents() {
    // 处理未就绪/失败状态：
    if (!this.analytics) {
      throw new HttpError(503, 'Analytics not ready');   // 例如返回 503
      // 或：return { events: [] };                      // 后备值
      // 或：this.logger.warn('Analytics unavailable');  // 跳过操作
      //     return ;
    }
    return this.analytics.track('page_view');
  }
}
```
</details>

**重要的类型要求：**

YasuiJS 验证延迟注入是否使用 `| null` 类型标注，**仅适用于类类型**。这是由于 TypeScript 反射元数据的限制。

✅ **有效**（类类型）：

如果缺少 `| null`，YasuiJS 启动时会引发装饰器验证错误：
```typescript
@Inject('TOKEN') service: MyService | null // ✅ 已验证
```

❌ **未验证**（可以编译但不会检查）：
```typescript
@Inject('TOKEN') config: object | null         // ⚠️ 未验证（字面类型）
@Inject('TOKEN') data: { foo: string } | null  // ⚠️ 未验证（内联类型）
```

### 循环依赖

YasuiJS 在启动时自动检测并防止循环依赖：

```typescript
// 这将被检测并报告为错误
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // 循环依赖！
}
```