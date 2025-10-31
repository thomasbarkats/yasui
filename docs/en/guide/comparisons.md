# Framework Comparisons

YasuiJS provides a modern, lightweight alternative to existing frameworks. This page compares YasuiJS with NestJS and Express across common use cases.

## Philosophy

**YasuiJS**: Decorator-driven, class-based architecture with minimal dependencies. **Built on Web Standards with [SRVX](https://srvx.h3.dev)** for true multi-runtime support (Node.js, Deno, Bun) and edge deployment compatibility.

**NestJS**: Enterprise-grade framework with extensive features, Angular-inspired architecture. **Built on Express** (Node.js-only, traditional HTTP architecture).

**Express**: Minimalist, functional approach. Unopinionated and flexible, but requires more boilerplate for structured applications.

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
- **Global Middleware**: Logging middleware on all routes
- **Dependency Injection**: Services injected into controllers
- **Load Test**: 10 concurrent connections, 10 seconds per endpoint

### Bundle Size Comparison

Total footprint including node_modules and production build:

| Framework | node_modules | Production Build | Total |
|-----------|--------------|------------------|-------|
| **YasuiJS** 🏆 | **25.02 MB** | **5.99 KB** | **25.03 MB** |
| Express | 27.04 MB | 2.87 KB | 27.04 MB |
| NestJS | 34.88 MB | 7.07 KB | 34.88 MB |

**YasuiJS is 7.4% smaller than Express and 28.2% smaller than NestJS.**

### Runtime Performance

| Metric | YasuiJS | NestJS | Express |
|--------|---------|--------|---------|
| **Requests/sec** 🚀 | **5,157** 🏆 | 4,508 | 4,920 |
| **Avg Latency** | **1.45ms** 🏆 | 1.72ms | 1.51ms |
| **Cold Start** | 472ms | 915ms | 252ms 🏆 |
| **Memory Usage** | **10.66 MB** 🏆 | 16.48 MB | 12.68 MB |

### Key Findings

- ✅ **YasuiJS is 4.8% faster than Express**
- ✅ **YasuiJS is 14.4% faster than NestJS** across all endpoints
- ✅ **YasuiJS uses 16% less memory than Express**
- ✅ **YasuiJS uses 35% less memory than NestJS**

**Why YasuiJS Scales Better:**
- **Radix3 Router**: Efficient route matching for multiple endpoints
- **DI Caching**: Dependencies resolved once and cached
- **Decorator Metadata**: Pre-computed at startup, not per-request
- **Optimized Middleware**: Promise-based pipeline with minimal overhead

The more complex your API becomes, the more YasuiJS's architecture advantages shine.

::: details Detailed Endpoint Performance

#### GET /users (List all users)
| Framework | Requests/sec | Avg Latency | P99 Latency |
|-----------|--------------|-------------|-------------|
| **YasuiJS** | **5,084** 🏆 | 1.47ms | 8ms |
| NestJS | 4,603 | 1.63ms | 8ms |
| Express | 4,401 | 1.75ms | 10ms |

#### GET /products/:id (Get by ID with type casting)
| Framework | Requests/sec | Avg Latency | P99 Latency |
|-----------|--------------|-------------|-------------|
| **YasuiJS** | **5,352** 🏆 | 1.10ms | 6ms |
| NestJS | 4,643 | 1.31ms | 7ms |
| Express | 4,954 | 1.18ms | 9ms |

#### GET /orders/user/:userId (Nested routes)
| Framework | Requests/sec | Avg Latency | P99 Latency |
|-----------|--------------|-------------|-------------|
| **YasuiJS** | **5,389** 🏆 | 1.08ms | 6ms |
| NestJS | 4,011 | 1.89ms | 9ms |
| Express | 4,968 | 1.23ms | 8ms |

:::

## When should you choose YasuiJS?

**🏆 Choose YasuiJS** if you want:
- **Best runtime performance**
- **Smallest bundle size**
- **Lowest memory footprint**
- Modern decorator-driven DX like NestJS
- Lightweight installation and fast cold starts
- Multi-runtime deployment (Node.js, Deno, Bun, edge runtimes)
- Automatic type casting without pipes or configuration
- Consistent patterns across controllers, middleware, and services

**Choose NestJS** if you need:
- GraphQL, microservices, WebSockets out-of-the-box
- Extensive plugin ecosystem (Passport, TypeORM, etc.)
- Battle-tested enterprise features
- Large community and extensive documentation

**Choose Express** if you prefer:
- Functional programming style over class-based
- Existing large Express ecosystem and middleware
- Minimal abstraction over Node.js HTTP
