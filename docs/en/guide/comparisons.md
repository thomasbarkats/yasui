# Framework Comparisons

Love NestJS's decorator-driven architecture but building REST APIs? **YasuiJS gives you the same elegant DX—25.9% faster, with zero bloat, on modern Web Standards.**

## Why YasuiJS over NestJS?

Most backends are REST APIs. You don't need GraphQL, WebSockets, or microservices features—**you need clean controllers, DI, and speed.** That's exactly what YasuiJS delivers.

YasuiJS **keeps all the good parts from NestJS:**

**Familiar patterns:**
- ✅ Decorators: `@Controller`, `@Get`, `@Post`, `@Injectable`, `@Inject`
- ✅ Dependency Injection with automatic resolution
- ✅ Class-based architecture with TypeScript-first design
- ✅ Swagger/OpenAPI auto-generation

**But refined:**
- 🎯 **No module boilerplate** - Just controllers and services
- 🎯 **Automatic type casting** - Works everywhere, zero config
- 🎯 **Consistent patterns** - Same decorators in controllers and middleware
- 🎯 **Flexible DI** - Allows deferred asynchronous injections
- 🎯 **Multi-runtime** - Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge

### Web Standards: The Modern Choice

**YasuiJS** is built on **Web Standards (SRVX)**:
- Deploy to Node.js, Deno, Bun, edge runtimes
- Uses Fetch API, native Request/Response
- Edge-ready for serverless and distributed computing
- Future-proof architecture that evolves with the platform

**NestJS** is built on **Express** (2010 Node.js HTTP):
- Node.js-only, can't run on Deno, Bun, or edge
- Legacy HTTP architecture, incompatible with modern runtimes
- Abstraction layers add weight and latency

### The Performance Advantage

**YasuiJS is 25.9% faster than NestJS.**

| Aspect | YasuiJS | NestJS |
|--------|---------|--------|
| **Focus** | REST APIs (mastered) | Everything (comprehensive) |
| **Philosophy** | Minimalist, sharp | Batteries-included |
| **Bundle Size** | Lightweight | Feature-rich |
| **Cold Start** | Fast (serverless-optimized) | Slower (more features to load) |
| **Runtime** | Multi-runtime (Node, Deno, Bun, edge) | Node.js focus |
| **Foundation** | Web Standards (modern) | Express (legacy) |

When you only ship what you need, everything gets faster. **YasuiJS doesn't include GraphQL, WebSockets, or CQRS**—and if you don't need them, **why pay the performance cost?**

## Code Examples

### Basic Controller with Dependency Injection

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

// Server setup
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

// Server setup
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

```javascript [Express]
const express = require('express');
const app = express();

// Manual dependency management
class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

// Manual route registration
const userService = new UserService();

app.get('/users', (req, res) => {
  const users = userService.getUsers();
  res.json(users);
});

app.listen(3000);
```

:::

**Key Differences:**
- **YasuiJS**: Built on **Web Standards** with [SRVX](https://srvx.h3.dev) → **multi-runtime support** (Node.js, Deno, Bun, Edge). No module system needed, automatic DI resolution.
- **NestJS**: Built on **Express** → **Node-only**, old architecture. Requires module declaration with providers/controllers.
- **Express**: Functional style, no DI, manual service instantiation and route registration.

---

### Route Parameters with Automatic Type Casting

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Param, Query } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(
    @Param('id') id: number,           // Automatically converted to number
    @Query('include') include: boolean, // Automatically converted to boolean
    @Query('tags', [String]) tags: string[]  // Array support
  ) {
    console.log(typeof id);      // 'number'
    console.log(typeof include); // 'boolean'
    console.log(Array.isArray(tags)); // true

    return { id, include, tags };
  }
}

// No additional setup needed - works out of the box!
```

```typescript [NestJS]
import { Controller, Get, Param, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { Type } from 'class-transformer';

// Need to create DTO classes for complex types
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
    @Param('id', ParseIntPipe) id: number,  // Must specify pipe for each param
    @Query() query: GetUserDto               // Or use DTO with ValidationPipe
  ) {
    return { id, include: query.include, tags: query.tags };
  }
}

// Must enable global validation pipe in main.ts
app.useGlobalPipes(new ValidationPipe({ transform: true }));
```

```javascript [Express]
const express = require('express');
const app = express();

app.get('/users/:id', (req, res) => {
  // Manual parsing required
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

**Key Differences:**
- **YasuiJS**: Automatic type casting based on TypeScript types, works everywhere including middlewares
- **NestJS**: Requires pipes (ParseIntPipe, etc.) or global ValidationPipe with DTOs
- **Express**: Complete manual parsing and validation

---

### Middleware with Parameter Extraction

::: code-group

```typescript [YasuiJS]
import { Middleware, Header, Query, Inject } from 'yasui';

@Middleware()
export class AuthMiddleware {
  constructor(private authService: AuthService) {}

  use(
    @Header('authorization') token: string,
    @Query('apiVersion') version: number,  // Type casting works in middleware!
    @Inject() logger: LoggerService
  ) {
    if (!token || !this.authService.verify(token)) {
      throw new HttpError(401, 'Unauthorized');
    }

    logger.log(`Auth success for API v${version}`);
    // Continues automatically if no error thrown
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
    // Manual extraction from req object
    const token = req.headers['authorization'];
    const version = parseInt(req.query.apiVersion as string, 10);

    if (!token || !this.authService.verify(token)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  }
}

// Must configure in module
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

// Function-based middleware
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

**Key Differences:**
- **YasuiJS**: Same decorators as controllers, automatic DI, automatic type casting in middleware
- **NestJS**: Different pattern from controllers, manual extraction, requires module configuration
- **Express**: Function-based, manual DI through closures, manual extraction

---

### Error Handling

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Injectable, HttpError } from 'yasui';

@Injectable()
class UserService {
  findUser(id: string) {
    const user = database.find(id);
    if (!user) {
      // Throw anywhere - automatically caught
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
    // No try-catch needed - errors automatically handled
    return await this.userService.findUser(id);
  }
}

// Automatic error response:
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
    // Errors automatically caught by NestJS
    return await this.userService.findUser(id);
  }
}

// Automatic error response (similar to YasuiJS)
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
    next(error); // Must pass to error handler
  }
});

// Must define error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message
  });
});
```

:::

**Key Differences:**
- **YasuiJS**: Automatic error catching everywhere, consistent error format
- **NestJS**: Automatic error catching, similar approach to YasuiJS
- **Express**: Manual try-catch, must pass errors to next(), custom error handler needed

---

### Deferred Dependency Initialization

YasuiJS allows non-blocking asynchronous injections with `deferred: true` if necessary. Dependency is initialized in the background, and may therefore be null. You can handle errors in the factory (e.g., send an internal alert), and provide fallback behavior in services that use the dependency.

NestJS does not allow this.

See a complete example in the [Dependency Injection](/reference/dependency-injection#deferred-deps) documentation.

---

### Swagger/OpenAPI Documentation

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

// Server setup
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
// Swagger UI available at /docs
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

// In main.ts
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

// Swagger setup
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

**Key Differences:**
- **YasuiJS**: Decorator-based, flexible definition formats, auto-registration
- **NestJS**: Decorator-based, similar to YasuiJS, verbose object syntax
- **Express**: JSDoc comments or manual JSON, separated from code

## Performance Benchmarks

Node.js v22 with Windows 11. All frameworks implement identical functionality.

### Test Setup

A realistic REST API with:
- **3 Controllers**: User, Product, Order
- **9 Endpoints**: List resources, get by ID, filter by category/user/status
- **Dependency Injection**: Services injected into controllers
- **Load Test**: 10 concurrent connections, 10 seconds per endpoint

### Runtime Performance

| Metric | YasuiJS | Express | NestJS |
|--------|---------|---------|--------|
| **Requests/sec** 🚀 | **6,850** 🏆 | 5,505 | 5,442 |
| **Avg Latency** | **0.98ms** 🏆 | 1.31ms | 1.31ms |
| **Cold Start** | 247ms | 15ms 🏆 | 582ms |

### Key Findings

- ✅ **YasuiJS is 24.4% faster than Express**
- ✅ **YasuiJS is 25.9% faster than NestJS** across all endpoints

**Why YasuiJS Scales Better:**
- **Radix3 Router**: Efficient route matching for multiple endpoints
- **DI Caching**: Dependencies resolved once and cached
- **Decorator Metadata**: Pre-computed at startup, not per-request
- **Optimized Middleware**: Promise-based pipeline with minimal overhead

## Decision Guide: Which Framework?

### ✅ Choose YasuiJS if:

**You're building REST APIs only**
- You don't need GraphQL, WebSockets, or microservices features
- You want the decorator/DI pattern without the enterprise complexity
- You value simplicity and performance over comprehensive features

**You want minimal dependencies**
- Small bundle size matters (serverless, edge deployments)
- Fast cold starts are critical
- You prefer integrating libraries yourself vs. framework-provided solutions

**You need multi-runtime support**
- Deploy to Node.js, Deno, Bun, or edge runtimes (Cloudflare Workers, Vercel Edge)
- Future-proof architecture based on Web Standards
- Not locked into Node.js ecosystem

**You like NestJS DX but find it too heavy**
- You appreciate decorators, DI, and class-based patterns
- You don't need all the built-in features NestJS provides
- You prefer "bring your own libraries" over opinionated integrations

**Perfect for:**
- Simple to medium REST APIs
- Serverless/edge-deployed APIs
- New projects that may need to run on multiple runtimes
- Teams that value simplicity and control over convenience
- Performance-critical applications where every millisecond counts

---

### ✅ Choose NestJS if:

**You need more than REST APIs**
- GraphQL, WebSockets, microservices, Server-Sent Events
- CQRS, Event Sourcing, message queues
- Multiple transport layers (TCP, gRPC, MQTT, etc.)

**You want batteries-included**
- Pre-built integrations: Passport, TypeORM, Prisma, Bull, Redis
- Opinionated structure for large teams and complex applications
- Less decision-making about architecture and libraries

**You need enterprise features**
- Established patterns for monolithic applications
- Extensive documentation and learning resources
- Large community (100k+ developers) and commercial support
- Proven in production at scale

**You're building complex applications**
- Multiple interconnected services
- Need for advanced patterns (interceptors, guards, pipes, filters)
- Large teams requiring strict architectural guidelines

**Perfect for:**
- Enterprise applications with many moving parts
- Full-featured backends with diverse transport protocols
- Teams that prefer framework-provided solutions
- Projects where time-to-market matters more than bundle size
- Organizations requiring mature, battle-tested solutions
