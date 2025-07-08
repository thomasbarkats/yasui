# 基本概念

本指南介绍了使YasuiJS工作的基本概念。理解这些概念将帮助您构建更好的API并充分利用框架的架构。

## 概述

YasuiJS围绕一些核心概念构建：

- **控制器**：定义您的API端点并处理HTTP请求
- **服务**：包含您的业务逻辑和数据操作
- **依赖注入**：自动管理组件之间的关系
- **装饰器**：以声明方式提供元数据和配置
- **中间件**：在到达控制器之前以管道方式处理请求

## 控制器

**控制器是API的入口点。** 它们定义了存在哪些端点以及如何响应HTTP请求。

### 控制器的作用

控制器有一个主要职责：将HTTP请求转换为业务操作并返回适当的响应。它们应该是将实际工作委托给服务的薄层。

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

### 控制器的重要性

- **路由组织**：逻辑地将相关端点组织在一起
- **请求处理**：自动提取和验证请求数据
- **响应格式化**：返回自动序列化的数据
- **关注点分离**：将HTTP逻辑与业务逻辑分开

控制器应该专注于HTTP关注点（路由、状态码、头部），同时将业务逻辑委托给服务。

## 服务

**服务包含您的业务逻辑。** 它们执行应用程序需要完成的实际工作，独立于该工作是如何被请求的。

### 服务的作用

服务封装业务操作，可以被多个控制器使用。它们处理数据处理、外部API调用和业务规则等事项。

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

### 服务的重要性

- **可重用性**：多个控制器可以使用同一个服务
- **可测试性**：业务逻辑可以独立于HTTP进行测试
- **组织性**：相关的业务操作被组织在一起
- **可维护性**：业务逻辑的变更不影响控制器

服务应该专注于应用程序"做什么"，而不是"如何"访问它。

## 依赖注入

**依赖注入自动管理组件之间的关系。** 不是手动创建和连接对象，而是由YasuiJS为您完成。

### 工作原理

当YasuiJS看到一个控制器需要一个服务时，它会自动创建该服务并注入它：

```typescript
@Injectable()
export class UserService {
  // 服务实现
}

@Controller('/users')
export class UserController {
  // UserService被自动创建和注入
  constructor(private userService: UserService) {}
}
```

### 依赖注入的重要性

- **松耦合**：组件不创建自己的依赖
- **可测试性**：易于用模拟对象替换依赖进行测试
- **灵活性**：无需修改消费者即可更改实现
- **生命周期管理**：框架处理对象的创建和清理

您声明需要什么，框架会找出如何提供它。

## 装饰器

**装饰器提供关于代码的元数据。** 它们告诉YasuiJS如何解释和配置您的类和方法。

### 装饰器的作用

装饰器用声明性注解替代配置文件和手动设置：

```typescript
@Controller('/api/users')    // 这个类处理/api/users路由
export class UserController {
  
  @Get('/:id')              // 这个方法处理GET请求
  getUser(@Param('id') id: string) {  // 从URL提取'id'
    return { id, name: 'John' };
  }
}
```

### 装饰器类型

- **类装饰器**：`@Controller()`、`@Injectable()`、`@Middleware()` - 定义类代表什么
- **方法装饰器**：`@Get()`、`@Post()`、`@Put()` - 定义HTTP方法和路由
- **参数装饰器**：`@Param()`、`@Body()`、`@Query()` - 提取请求数据

### 装饰器的重要性

- **声明式**：代码清晰地表明其意图
- **共同定位**：配置与其配置的代码放在一起
- **类型安全**：TypeScript可以验证装饰器的使用
- **自动处理**：框架读取装饰器并配置一切

装饰器使您的代码自文档化并消除手动连接。

## 中间件

**中间件在管道中处理请求。** 每个中间件可以在请求到达控制器之前检查、修改或停止请求。

### 中间件的工作原理

中间件函数按顺序运行，每个都决定是否继续到下一步：

```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    // 检查认证
    if (req.headers.authorization) {
      next(); // 继续到下一个中间件或控制器
    } else {
      throw new Error('Unauthorized'); // 在这里停止
    }
  }
}
```

### 中间件级别

中间件可以应用于不同级别：

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

### 中间件的重要性

- **横切关注点**：全局处理认证、日志记录、验证
- **可重用性**：同一中间件可以在不同路由中使用
- **可组合性**：组合多个中间件实现复杂行为
- **分离**：将认证等关注点与业务逻辑分开

中间件让您构建既强大又可维护的请求处理管道。

## 所有概念如何协同工作

这些概念结合起来创建一个清晰的架构：

```typescript
// 1. 中间件处理请求
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    // 认证请求
    next();
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

// 3. 控制器协调HTTP和业务层
@Controller('/users', AuthMiddleware)
export class UserController {
  constructor(private userService: UserService) {} // 依赖注入

  @Post('/') // 装饰器定义路由
  createUser(@Body() userData: any) { // 装饰器提取数据
    return this.userService.createUser(userData); // 委托给服务
  }
}
```

### 请求流程

1. **请求到达**您的API
2. **中间件**处理它（认证、日志等）
3. **控制器**通过装饰器接收请求
4. **依赖注入**提供所需服务
5. **服务**执行业务操作
6. **控制器**返回结果
7. **框架**序列化并发送响应

## 这种架构的好处

### 关注点分离
每个组件都有明确的单一职责：
- 控制器处理HTTP
- 服务处理业务逻辑
- 中间件处理横切关注点

### 可测试性
组件可以独立测试：
- 无需HTTP测试服务
- 使用模拟服务测试控制器
- 独立测试中间件

### 可维护性
变更是局部的：
- 业务逻辑变更不影响控制器
- 路由变更不影响服务
- 新功能可以重用现有服务

### 可扩展性
架构支持增长：
- 轻松添加新控制器
- 在控制器之间共享服务
- 组合中间件满足复杂需求

## 何时使用什么

### 使用控制器：
- 定义API端点
- 提取请求数据
- 设置响应状态码
- 协调服务之间的关系

### 使用服务：
- 业务逻辑和规则
- 数据处理
- 外部API调用
- 可能被重用的操作

### 使用依赖注入：
- 将服务连接到控制器
- 管理对象生命周期
- 使测试更容易
- 保持代码松耦合

### 使用装饰器：
- 定义路由和HTTP方法
- 提取请求参数
- 配置中间件
- 为文档添加元数据

### 使用中间件：
- 认证和授权
- 请求/响应日志记录
- 输入验证
- 速率限制
- 错误处理