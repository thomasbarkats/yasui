# 框架对比

YasuiJS 为现有框架提供了一个现代、轻量级的替代方案。本页面比较了 YasuiJS 与 NestJS 和 Express 在常见用例中的表现。

## 设计理念

**YasuiJS**：装饰器驱动、基于类的架构，依赖最少。**基于 Web 标准构建，使用 [SRVX](https://srvx.h3.dev)**，真正支持多运行时（Node.js、Deno、Bun）和边缘部署兼容性。

**NestJS**：企业级框架，功能丰富，受 Angular 启发的架构。**基于 Express 构建**（仅支持 Node.js，传统 HTTP 架构）。

**Express**：极简主义、函数式方法。无偏见且灵活，但结构化应用需要更多样板代码。

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
- **全局中间件**：所有路由上的日志中间件
- **依赖注入**：服务注入到控制器中
- **负载测试**：10 个并发连接，每个端点 10 秒

### 包大小对比

包括 node_modules 和生产构建的总占用空间：

| 框架 | node_modules | 生产构建 | 总计 |
|-----------|--------------|------------------|-------|
| **YasuiJS** 🏆 | **25.02 MB** | **5.99 KB** | **25.03 MB** |
| Express | 27.04 MB | 2.87 KB | 27.04 MB |
| NestJS | 34.88 MB | 7.07 KB | 34.88 MB |

**YasuiJS 比 Express 小 7.4%，比 NestJS 小 28.2%。**

### 运行时性能

| 指标 | YasuiJS | NestJS | Express |
|--------|---------|--------|---------|
| **请求/秒** 🚀 | **5,157** 🏆 | 4,508 | 4,920 |
| **平均延迟** | **1.45ms** 🏆 | 1.72ms | 1.51ms |
| **冷启动** | 472ms | 915ms | 252ms 🏆 |
| **内存使用** | **10.66 MB** 🏆 | 16.48 MB | 12.68 MB |

### 主要发现

- ✅ **YasuiJS 比 Express 快 4.8%**
- ✅ **YasuiJS 在所有端点上比 NestJS 快 14.4%**
- ✅ **YasuiJS 比 Express 少用 16% 内存**
- ✅ **YasuiJS 比 NestJS 少用 35% 内存**

**为什么 YasuiJS 扩展性更好：**
- **Radix3 路由器**：多端点的高效路由匹配
- **DI 缓存**：依赖项解析一次并缓存
- **装饰器元数据**：在启动时预计算，而非每次请求
- **优化的中间件**：基于 Promise 的管道，开销最小

您的 API 越复杂，YasuiJS 的架构优势就越明显。

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

## 何时应该选择 YasuiJS？

**🏆 选择 YasuiJS** 如果您想要：
- **最佳运行时性能**
- **最小包大小**
- **最低内存占用**
- 类似 NestJS 的现代装饰器驱动开发体验
- 轻量级安装和快速冷启动
- 多运行时部署（Node.js、Deno、Bun、边缘运行时）
- 无需管道或配置的自动类型转换
- 控制器、中间件和服务间的一致模式

**选择 NestJS** 如果您需要：
- 开箱即用的 GraphQL、微服务、WebSockets
- 丰富的插件生态系统（Passport、TypeORM 等）
- 经过实战检验的企业级功能
- 庞大的社区和详尽的文档

**选择 Express** 如果您偏好：
- 函数式编程风格而非基于类的
- 现有的庞大 Express 生态系统和中间件
- 对 Node.js HTTP 的最小抽象