# 框架对比

喜欢 NestJS 的装饰器驱动架构但只构建 REST API？**YasuiJS 提供相同的优雅体验——速度快 25%，无冗余，基于现代 Web 标准。**

## 为什么选择 YasuiJS 而不是 NestJS？

大多数后端都是 REST API。您不需要 GraphQL、WebSockets 或微服务功能——**您需要的是清晰的控制器、依赖注入和速度。** 这正是 YasuiJS 提供的。

YasuiJS **保留了 NestJS 的所有优点：**

**熟悉的模式：**
- ✅ 装饰器：`@Controller`、`@Get`、`@Post`、`@Injectable`、`@Inject`
- ✅ 自动解析的依赖注入
- ✅ TypeScript 优先的基于类的架构
- ✅ Swagger/OpenAPI 自动生成

**但更精炼：**
- 🎯 **无模块样板** - 只需控制器和服务
- 🎯 **自动类型转换** - 随处可用，零配置
- 🎯 **一致的模式** - 控制器和中间件使用相同的装饰器
- 🎯 **灵活的 DI** - 允许延迟异步注入
- 🎯 **多运行时** - Node.js、Deno、Bun、Cloudflare Workers、Vercel Edge

### Web 标准：现代选择

**YasuiJS** 基于 **Web 标准（SRVX）** 构建：
- 部署到 Node.js、Deno、Bun、边缘运行时
- 使用 Fetch API、原生 Request/Response
- 为无服务器和分布式计算做好边缘准备
- 随平台演进的未来验证架构

**NestJS** 基于 **Express**（2010 年的 Node.js HTTP）构建：
- 仅限 Node.js，无法在 Deno、Bun 或边缘运行
- 传统 HTTP 架构，与现代运行时不兼容
- 抽象层增加了重量和延迟

### 性能优势

**YasuiJS 比 NestJS 快 25%。**

| 方面 | YasuiJS | NestJS |
|------|---------|--------|
| **专注** | REST API（精通） | 一切（全面） |
| **理念** | 极简主义，精准 | 包含电池 |
| **包大小** | 轻量级 | 功能丰富 |
| **冷启动** | 快速（无服务器优化） | 较慢（更多功能加载） |
| **运行时** | 多运行时（Node、Deno、Bun、边缘） | 专注 Node.js |
| **基础** | Web 标准（现代） | Express（传统） |

当您只交付所需内容时，一切都会变得更快。**YasuiJS 不包含 GraphQL、WebSockets 或 CQRS**——如果您不需要它们，**为什么要付出性能代价？**

## 代码示例

### 带依赖注入的基础控制器

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Injectable } from 'yasui';

@Injectable()
class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}

// 服务器设置
import yasui from 'yasui';
yasui.createServer({
  controllers: [UserController]
});
```

```typescript [NestJS]
import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

@Injectable()
class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.getUsers();
  }
}

@Module({
  controllers: [UserController],
  providers: [UserService]
})
export class AppModule {}

// 服务器设置
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

```javascript [Express]
const express = require('express');
const app = express();

// 手动依赖管理
class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

// 手动路由注册
const userService = new UserService();

app.get('/users', (req, res) => {
  const users = userService.getUsers();
  res.json(users);
});

app.listen(3000);
```

:::

**主要区别：**
- **YasuiJS**：基于 **Web 标准** 构建，使用 [SRVX](https://srvx.h3.dev) → **多运行时支持**（Node.js、Deno、Bun、Edge）。无需模块系统，自动 DI 解析。
- **NestJS**：基于 **Express** 构建 → **仅支持 Node**，旧架构。需要模块声明和 providers/controllers。
- **Express**：函数式风格，无 DI，手动服务实例化和路由注册。

---

### 带自动类型转换的路由参数

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Param, Query } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(
    @Param('id') id: number,           // 自动转换为数字
    @Query('include') include: boolean, // 自动转换为布尔值
    @Query('tags', [String]) tags: string[]  // 数组支持
  ) {
    console.log(typeof id);      // 'number'
    console.log(typeof include); // 'boolean'
    console.log(Array.isArray(tags)); // true

    return { id, include, tags };
  }
}

// 无需额外设置 - 开箱即用！
```

```typescript [NestJS]
import { Controller, Get, Param, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { Type } from 'class-transformer';

// 需要为复杂类型创建 DTO 类
class GetUserDto {
  @Type(() => Boolean)
  include: boolean;

  @Type(() => String)
  tags: string[];
}

@Controller('users')
export class UserController {
  @Get(':id')
  getUser(
    @Param('id', ParseIntPipe) id: number,  // 必须为每个参数指定管道
    @Query() query: GetUserDto               // 或使用 DTO 和 ValidationPipe
  ) {
    return { id, include: query.include, tags: query.tags };
  }
}

// 必须在 main.ts 中启用全局验证管道
app.useGlobalPipes(new ValidationPipe({ transform: true }));
```

```javascript [Express]
const express = require('express');
const app = express();

app.get('/users/:id', (req, res) => {
  // 需要手动解析
  const id = parseInt(req.params.id, 10);
  const include = req.query.include === 'true';
  const tags = Array.isArray(req.query.tags)
    ? req.query.tags
    : [req.query.tags].filter(Boolean);

  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID' });
  }

  res.json({ id, include, tags });
});
```

:::

**主要区别：**
- **YasuiJS**：基于 TypeScript 类型的自动类型转换，在包括中间件在内的任何地方都能工作
- **NestJS**：需要管道（ParseIntPipe 等）或全局 ValidationPipe 与 DTO
- **Express**：完全手动解析和验证

---

### 带参数提取的中间件

::: code-group

```typescript [YasuiJS]
import { Middleware, Header, Query, Inject } from 'yasui';

@Middleware()
export class AuthMiddleware {
  constructor(private authService: AuthService) {}

  use(
    @Header('authorization') token: string,
    @Query('apiVersion') version: number,  // 类型转换在中间件中也能工作！
    @Inject() logger: LoggerService
  ) {
    if (!token || !this.authService.verify(token)) {
      throw new HttpError(401, 'Unauthorized');
    }

    logger.log(`Auth success for API v${version}`);
    // 如果没有抛出错误，自动继续
  }
}

@Controller('/users', AuthMiddleware)
export class UserController { /* ... */ }
```

```typescript [NestJS]
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // 从 req 对象手动提取
    const token = req.headers['authorization'];
    const version = parseInt(req.query.apiVersion as string, 10);

    if (!token || !this.authService.verify(token)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  }
}

// 必须在模块中配置
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(UserController);
  }
}
```

```javascript [Express]
const express = require('express');
const app = express();

// 基于函数的中间件
function authMiddleware(authService) {
  return (req, res, next) => {
    const token = req.headers['authorization'];
    const version = parseInt(req.query.apiVersion, 10);

    if (!token || !authService.verify(token)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  };
}

const authService = new AuthService();
app.use('/users', authMiddleware(authService));
```

:::

**主要区别：**
- **YasuiJS**：与控制器相同的装饰器，自动 DI，中间件中自动类型转换
- **NestJS**：与控制器不同的模式，手动提取，需要模块配置
- **Express**：基于函数，通过闭包手动 DI，手动提取

---

### 错误处理

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Injectable, HttpError } from 'yasui';

@Injectable()
class UserService {
  findUser(id: string) {
    const user = database.find(id);
    if (!user) {
      // 在任何地方抛出 - 自动捕获
      throw new HttpError(404, 'User not found');
    }
    return user;
  }
}

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/:id')
  async getUser(@Param('id') id: string) {
    // 无需 try-catch - 错误自动处理
    return await this.userService.findUser(id);
  }
}

// 自动错误响应：
// {
//   "status": 404,
//   "message": "User not found",
//   "path": "/users/123",
//   "method": "GET",
//   ...
// }
```

```typescript [NestJS]
import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
class UserService {
  findUser(id: string) {
    const user = database.find(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get(':id')
  async getUser(@Param('id') id: string) {
    // 错误由 NestJS 自动捕获
    return await this.userService.findUser(id);
  }
}

// 自动错误响应（类似于 YasuiJS）
```

```javascript [Express]
const express = require('express');
const app = express();

class UserService {
  findUser(id) {
    const user = database.find(id);
    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }
    return user;
  }
}

app.get('/users/:id', async (req, res, next) => {
  try {
    const userService = new UserService();
    const user = await userService.findUser(req.params.id);
    res.json(user);
  } catch (error) {
    next(error); // 必须传递给错误处理器
  }
});

// 必须定义错误处理器
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message
  });
});
```

:::

**主要区别：**
- **YasuiJS**：任何地方自动错误捕获，一致的错误格式
- **NestJS**：自动错误捕获，与 YasuiJS 类似的方法
- **Express**：手动 try-catch，必须将错误传递给 next()，需要自定义错误处理器

---

### 延迟依赖初始化

YasuiJS 允许在必要时使用 `deferred: true` 进行非阻塞异步注入。依赖项在后台初始化，因此可能为 null。您可以在工厂中处理错误（例如，发送内部警报），并在使用依赖项的服务中提供后备行为。

NestJS 不允许这样做。

请参阅[依赖注入](/reference/dependency-injection#deferred-deps)文档中的完整示例。

---

### Swagger/OpenAPI 文档

::: code-group

```typescript [YasuiJS]
import { Controller, Post, Body, ApiOperation, ApiBody, ApiResponse } from 'yasui';

class CreateUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: 'string', format: 'email' })
  email: string;
}

@Controller('/users')
export class UserController {
  @Post('/')
  @ApiOperation('Create user', 'Creates a new user account')
  @ApiBody('User data', CreateUserDto)
  @ApiResponse(201, 'User created', CreateUserDto)
  @ApiResponse(400, 'Invalid data')
  createUser(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }
}

// 服务器设置
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    info: {
      title: 'My API',
      version: '1.0.0'
    }
  }
});
// Swagger UI 可在 /docs 访问
```

```typescript [NestJS]
import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

class CreateUserDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ format: 'email' })
  email: string;
}

@Controller('users')
export class UserController {
  @Post()
  @ApiOperation({ summary: 'Create user', description: 'Creates a new user account' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created', type: CreateUserDto })
  @ApiResponse({ status: 400, description: 'Invalid data' })
  createUser(@Body() data: CreateUserDto) {
    return this.userService.create(data);
  }
}

// 在 main.ts 中
const config = new DocumentBuilder()
  .setTitle('My API')
  .setVersion('1.0.0')
  .build();
const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

```javascript [Express]
const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const app = express();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create user
 *     description: Creates a new user account
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Invalid data
 */
app.post('/users', (req, res) => {
  const user = userService.create(req.body);
  res.status(201).json(user);
});

// Swagger 设置
const specs = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: { title: 'My API', version: '1.0.0' }
  },
  apis: ['./routes/*.js']
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
```

:::

**主要区别：**
- **YasuiJS**：基于装饰器，灵活的定义格式，自动注册
- **NestJS**：基于装饰器，类似于 YasuiJS，冗长的对象语法
- **Express**：JSDoc 注释或手动 JSON，与代码分离

## 性能基准测试

Node.js v22 与 Windows 11。所有框架实现相同功能。

### 测试设置

一个真实的 REST API，包含：
- **3 个控制器**：User、Product、Order
- **9 个端点**：列出资源、按 ID 获取、按类别/用户/状态过滤
- **依赖注入**：服务注入到控制器中

### 运行时性能

#### 轻负载（10 个并发连接，每个端点 10 秒）

| 指标 | YasuiJS | Express | NestJS |
|--------|---------|---------|--------|
| **请求/秒** 🚀 | **7,209** 🏆 | 6,602 | 5,695 |
| **平均延迟** | **0.91ms** 🏆 | 1.07ms | 1.26ms |
| **冷启动** | 280ms | 229ms 🏆 | 568ms |

**主要发现：**
- ✅ **YasuiJS 比 Express 快近 10%**
- ✅ **YasuiJS 比 NestJS 快超过 25%**

#### 重负载（100 个并发连接，每个端点 30 秒）

| 指标 | YasuiJS | Express | NestJS |
|--------|---------|---------|--------|
| **请求/秒** 🚀 | **6,951** 🏆 | 6,755 | 5,492 |
| **平均延迟** | **13.89ms** 🏆 | 14.31ms | 17.72ms |
| **冷启动** | 256ms | 225ms 🏆 | 595ms |

**主要发现：**
- ✅ **YasuiJS 比 NestJS 快超过 25%**

**为什么 YasuiJS 扩展性更好：**
- **Radix3 路由器**：多端点的高效路由匹配
- **DI 缓存**：依赖项解析一次并缓存
- **装饰器元数据**：在启动时预计算，而非每次请求
- **优化的中间件**：基于 Promise 的管道，开销最小

::: details 详细端点性能

#### GET /users（列出所有用户）
| 框架 | 请求/秒 | 平均延迟 | P99 延迟 |
|-----------|--------------|-------------|-------------|
| **YasuiJS** | **5,084** 🏆 | 1.47ms | 8ms |
| NestJS | 4,603 | 1.63ms | 8ms |
| Express | 4,401 | 1.75ms | 10ms |

#### GET /products/:id（按 ID 获取，带类型转换）
| 框架 | 请求/秒 | 平均延迟 | P99 延迟 |
|-----------|--------------|-------------|-------------|
| **YasuiJS** | **5,352** 🏆 | 1.10ms | 6ms |
| NestJS | 4,643 | 1.31ms | 7ms |
| Express | 4,954 | 1.18ms | 9ms |

#### GET /orders/user/:userId（嵌套路由）
| 框架 | 请求/秒 | 平均延迟 | P99 延迟 |
|-----------|--------------|-------------|-------------|
| **YasuiJS** | **5,389** 🏆 | 1.08ms | 6ms |
| NestJS | 4,011 | 1.89ms | 9ms |
| Express | 4,968 | 1.23ms | 8ms |

:::

## 决策指南：选择哪个框架？

### ✅ 选择 YasuiJS 如果：

**您只构建 REST API**
- 不需要 GraphQL、WebSockets 或微服务功能
- 想要装饰器/DI 模式但不要企业复杂性
- 重视简单性和性能而非全面的功能

**您想要最小依赖**
- 包大小很重要（无服务器、边缘部署）
- 快速冷启动至关重要
- 更喜欢自己集成库而非框架提供的解决方案

**您需要多运行时支持**
- 部署到 Node.js、Deno、Bun 或边缘运行时（Cloudflare Workers、Vercel Edge）
- 基于 Web 标准的面向未来架构
- 不被锁定在 Node.js 生态系统中

**您喜欢 NestJS 的 DX 但觉得太重**
- 欣赏装饰器、DI 和基于类的模式
- 不需要 NestJS 提供的所有内置功能
- 更喜欢"自带库"而非固执己见的集成

**非常适合：**
- 简单到中等的 REST API
- 无服务器/边缘部署的 API
- 可能需要在多个运行时上运行的新项目
- 重视简单性和控制而非便利性的团队
- 性能关键型应用，每毫秒都很重要

---

### ✅ 选择 NestJS 如果：

**您需要的不仅仅是 REST API**
- GraphQL、WebSockets、微服务、Server-Sent Events
- CQRS、事件溯源、消息队列
- 多个传输层（TCP、gRPC、MQTT 等）

**您想要包含电池**
- 预构建集成：Passport、TypeORM、Prisma、Bull、Redis
- 适合大型团队和复杂应用的固执己见结构
- 对架构和库的决策更少

**您需要企业功能**
- 单体应用的成熟模式
- 广泛的文档和学习资源
- 庞大的社区（10 万+开发者）和商业支持
- 在大规模生产中得到验证

**您正在构建复杂应用**
- 多个互连服务
- 需要高级模式（拦截器、守卫、管道、过滤器）
- 需要严格架构指南的大型团队

**非常适合：**
- 具有许多活动部件的企业应用
- 具有多种传输协议的全功能后端
- 更喜欢框架提供解决方案的团队
- 上市时间比包大小更重要的项目
- 需要成熟、经过验证的解决方案的组织

---

### 🤔 选择 Express 如果：

**您想要完全控制**
- 最小框架，最大灵活性
- 从头开始构建自己的架构
- 没有装饰器，没有 DI，纯函数式 JavaScript/TypeScript

**您有现有的中间件**
- 庞大的 Express 中间件生态系统（尽管许多在边缘运行时中无法工作）
- 成熟且广为理解的模式
- 庞大的社区和资源

**非常适合：**
- 简单的 API 或微服务
- 熟悉函数式模式的团队
- 需要最大灵活性的项目
- 想要学习 HTTP 基础知识时

---

### 💡 诚实的真相

**YasuiJS 是专注于 REST API 的工具。** 我们不试图成为所有人的一切。

- 如果您只需要 **REST API** → YasuiJS 以最小重量提供出色的 DX
- 如果您需要 **GraphQL、WebSockets、微服务** → 使用 NestJS
- 如果您需要 **最大灵活性** → 使用 Express

**没有"赢家"** - 只有不同工作的不同工具。根据您实际构建的内容进行选择。