# 基本概念

本指南介绍了让 YasuiJS 工作的基本概念。理解这些概念将帮助您构建更好的 API 并充分利用框架的架构。

## 概述

YasuiJS 围绕一些核心概念构建：

- **控制器（Controllers）**：定义您的 API 端点并处理 HTTP 请求
- **服务（Services）**：包含您的业务逻辑和数据操作
- **依赖注入（Dependency Injection）**：自动管理组件之间的关系
- **装饰器（Decorators）**：以声明式方式提供元数据和配置
- **中间件（Middleware）**：在到达控制器之前在管道中处理请求

## 控制器

**控制器是您 API 的入口点。** 它们定义存在哪些端点以及如何响应 HTTP 请求。

### 控制器的作用

控制器有一个主要职责：将 HTTP 请求转换为业务操作并返回适当的响应。它们应该是将实际工作委托给服务的薄层。

```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### 为什么控制器很重要

- **路由组织**：逻辑上将相关端点组合在一起
- **请求处理**：自动提取和验证请求数据
- **响应格式化**：返回自动序列化的数据
- **关注点分离**：保持 HTTP 逻辑与业务逻辑分离

控制器应该专注于 HTTP 关注点（路由、状态码、头部），同时将业务逻辑委托给服务。

## 服务

**服务包含您的业务逻辑。** 它们执行您的应用程序需要完成的实际工作，独立于如何请求该工作。

### 服务的作用

服务封装业务操作，可以被多个控制器使用。它们处理数据处理、外部 API 调用和业务规则等事务。

```typescript
@Injectable()
export class UserService {
  private users = [];

  getAllUsers() {
    return this.users;
  }

  createUser(userData) {
    // 业务逻辑在这里
    const user = { id: generateId(), ...userData };
    this.users.push(user);
    return user;
  }
}
```

### 为什么服务很重要

- **可重用性**：多个控制器可以使用同一个服务
- **可测试性**：业务逻辑可以独立于 HTTP 进行测试
- **组织性**：相关的业务操作被组合在一起
- **可维护性**：业务逻辑的更改不会影响控制器

服务应该专注于您的应用程序"做什么"，而不是"如何"访问它。

## 依赖注入

**依赖注入自动管理组件之间的关系。** YasuiJS 会为您完成这项工作，而不是手动创建和连接对象。

### 工作原理

当 YasuiJS 看到控制器需要服务时，它会自动创建服务并注入它：

```typescript
@Injectable()
export class UserService {
  // 服务实现
}

@Controller('/users')
export class UserController {
  // UserService 被自动创建和注入
  constructor(private userService: UserService) {}
}
```

### 为什么依赖注入很重要

- **松耦合**：组件不创建自己的依赖项
- **可测试性**：容易用模拟对象替换依赖项进行测试
- **灵活性**：在不修改消费者的情况下更改实现
- **生命周期管理**：框架处理对象创建和清理

您声明需要什么，框架会找出如何提供它。

## 装饰器

**装饰器提供关于您代码的元数据。** 它们告诉 YasuiJS 如何解释和配置您的类和方法。

### 装饰器的作用

装饰器用声明式注解替代配置文件和手动设置：

```typescript
@Controller('/api/users')    // 这个类处理 /api/users 路由
export class UserController {
  
  @Get('/:id')              // 这个方法处理 GET 请求
  getUser(@Param('id') id: string) {  // 从 URL 中提取 'id'
    return { id, name: 'John' };
  }
}
```

### 装饰器类型

- **类装饰器**：`@Controller()`、`@Injectable()`、`@Middleware()` - 定义类代表什么
- **方法装饰器**：`@Get()`、`@Post()`、`@Put()` - 定义 HTTP 方法和路由
- **参数装饰器**：`@Param()`、`@Body()`、`@Query()` - 提取请求数据

### 为什么装饰器很重要

- **声明式**：代码清楚地表达其意图
- **共置**：配置与其配置的代码位于同一位置
- **类型安全**：TypeScript 可以验证装饰器使用
- **自动处理**：框架读取装饰器并配置一切

装饰器使您的代码自文档化并消除手动连接。

## 中间件

**中间件在管道中处理请求。** 每个中间件可以在请求到达控制器之前检查、修改或停止请求。

### 中间件的工作原理

中间件函数按顺序运行，每个都决定是否继续到下一步：

```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request) {
    // 检查身份验证
    const authHeader = req.rawHeaders.get('authorization');
    if (!authHeader) {
      throw new Error('Unauthorized'); // 在这里停止
    }
    // 自动继续到下一个中间件或控制器
  }
}
```

中间件的工作方式类似于控制器方法 - 您可以返回值、抛出错误或不返回任何内容以继续。只有当您想修改响应时才需要使用 `@Next()`。

### 中间件级别

中间件可以在不同级别应用：

```typescript
// 全局：应用于所有请求
yasui.createServer({
  middlewares: [LoggingMiddleware]
});

// 控制器：应用于控制器中的所有路由
@Controller('/users', AuthMiddleware)
export class UserController {}

// 路由：应用于特定端点
@Get('/', ValidationMiddleware)
getUsers() {}
```

### 为什么中间件很重要

- **横切关注点**：全局处理身份验证、日志记录、验证
- **可重用性**：同一个中间件可以在不同路由中使用
- **可组合性**：组合多个中间件实现复杂行为
- **分离**：保持身份验证等关注点与业务逻辑分离

中间件让您构建既强大又可维护的请求处理管道。

## 所有概念如何协同工作

这些概念结合起来创建了一个清晰的架构：

```typescript
// 1. 中间件处理请求
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request) {
    // 验证请求
    if (!req.rawHeaders.get('authorization')) {
      throw new HttpError(401, 'Unauthorized');
    }
    // 自动继续
  }
}

// 2. 服务包含业务逻辑
@Injectable()
export class UserService {
  createUser(userData) {
    // 业务逻辑在这里
    return newUser;
  }
}

// 3. 控制器协调 HTTP 和业务层
@Controller('/users', AuthMiddleware)
export class UserController {
  constructor(private userService: UserService) {} // DI

  @Post('/') // 装饰器定义路由
  createUser(@Body() userData: any) { // 装饰器提取数据
    return this.userService.createUser(userData); // 委托给服务
  }
}
```

### 请求流程

1. **请求到达** 您的 API
2. **中间件** 处理它（身份验证、日志记录等）
3. **控制器** 通过装饰器接收请求
4. **依赖注入** 提供所需的服务
5. **服务** 执行业务操作
6. **控制器** 返回结果
7. **框架** 序列化并发送响应

## 这种架构的好处

### 关注点分离
每个组件都有明确的单一职责：
- 控制器处理 HTTP
- 服务处理业务逻辑
- 中间件处理横切关注点

### 可测试性
组件可以独立测试：
- 在没有 HTTP 的情况下测试服务
- 使用模拟服务测试控制器
- 独立测试中间件

### 可维护性
更改是局部化的：
- 业务逻辑更改不影响控制器
- 路由更改不影响服务
- 新功能可以重用现有服务

### 可扩展性
架构支持增长：
- 轻松添加新控制器
- 在控制器之间共享服务
- 为复杂需求组合中间件

## 何时使用什么

### 使用控制器用于：
- 定义 API 端点
- 提取请求数据
- 设置响应状态码
- 协调服务之间的关系

### 使用服务用于：
- 业务逻辑和规则
- 数据处理
- 外部 API 调用
- 可能被重用的操作

### 使用依赖注入用于：
- 将服务连接到控制器
- 管理对象生命周期
- 使测试更容易
- 保持代码松耦合

### 使用装饰器用于：
- 定义路由和 HTTP 方法
- 提取请求参数
- 配置中间件
- 为文档添加元数据

### 使用中间件用于：
- 身份验证和授权
- 请求/响应日志记录
- 输入验证
- 速率限制
- 错误处理