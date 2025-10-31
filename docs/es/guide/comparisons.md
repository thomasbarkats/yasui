# Comparaciones de Frameworks

YasuiJS proporciona una alternativa moderna y ligera a los frameworks existentes. Esta página compara YasuiJS con NestJS y Express en casos de uso comunes.

## Filosofía

**YasuiJS**: Arquitectura basada en clases impulsada por decoradores con dependencias mínimas. **Construido sobre Estándares Web con [SRVX](https://srvx.h3.dev)** para soporte verdadero multi-runtime (Node.js, Deno, Bun) y compatibilidad con despliegue en edge.

**NestJS**: Framework de nivel empresarial con características extensas, arquitectura inspirada en Angular. **Construido sobre Express** (solo Node.js, arquitectura HTTP tradicional).

**Express**: Enfoque minimalista y funcional. Sin opiniones y flexible, pero requiere más código repetitivo para aplicaciones estructuradas.

## Ejemplos de Código

### Controlador Básico con Inyección de Dependencias

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

// Configuración del servidor
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

// Configuración del servidor
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

```javascript [Express]
const express = require('express');
const app = express();

// Gestión manual de dependencias
class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

// Registro manual de rutas
const userService = new UserService();

app.get('/users', (req, res) => {
  const users = userService.getUsers();
  res.json(users);
});

app.listen(3000);
```

:::

**Diferencias Clave:**
- **YasuiJS**: Construido sobre **Estándares Web** con [SRVX](https://srvx.h3.dev) → **soporte multi-runtime** (Node.js, Deno, Bun, Edge). No necesita sistema de módulos, resolución automática de DI.
- **NestJS**: Construido sobre **Express** → **solo Node**, arquitectura antigua. Requiere declaración de módulo con providers/controllers.
- **Express**: Estilo funcional, sin DI, instanciación manual de servicios y registro de rutas.

---

### Parámetros de Ruta con Conversión Automática de Tipos

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Param, Query } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(
    @Param('id') id: number,           // Convertido automáticamente a número
    @Query('include') include: boolean, // Convertido automáticamente a booleano
    @Query('tags', [String]) tags: string[]  // Soporte para arrays
  ) {
    console.log(typeof id);      // 'number'
    console.log(typeof include); // 'boolean'
    console.log(Array.isArray(tags)); // true

    return { id, include, tags };
  }
}

// ¡No se necesita configuración adicional - funciona de inmediato!
```

```typescript [NestJS]
import { Controller, Get, Param, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { Type } from 'class-transformer';

// Necesita crear clases DTO para tipos complejos
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
    @Param('id', ParseIntPipe) id: number,  // Debe especificar pipe para cada parámetro
    @Query() query: GetUserDto               // O usar DTO con ValidationPipe
  ) {
    return { id, include: query.include, tags: query.tags };
  }
}

// Debe habilitar pipe de validación global en main.ts
app.useGlobalPipes(new ValidationPipe({ transform: true }));
```

```javascript [Express]
const express = require('express');
const app = express();

app.get('/users/:id', (req, res) => {
  // Análisis manual requerido
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

**Diferencias Clave:**
- **YasuiJS**: Conversión automática de tipos basada en tipos de TypeScript, funciona en todas partes incluyendo middlewares
- **NestJS**: Requiere pipes (ParseIntPipe, etc.) o ValidationPipe global con DTOs
- **Express**: Análisis y validación completamente manual

---

### Middleware con Extracción de Parámetros

::: code-group

```typescript [YasuiJS]
import { Middleware, Header, Query, Inject } from 'yasui';

@Middleware()
export class AuthMiddleware {
  constructor(private authService: AuthService) {}

  use(
    @Header('authorization') token: string,
    @Query('apiVersion') version: number,  // ¡La conversión de tipos funciona en middleware!
    @Inject() logger: LoggerService
  ) {
    if (!token || !this.authService.verify(token)) {
      throw new HttpError(401, 'Unauthorized');
    }

    logger.log(`Auth success for API v${version}`);
    // Continúa automáticamente si no se lanza error
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
    // Extracción manual del objeto req
    const token = req.headers['authorization'];
    const version = parseInt(req.query.apiVersion as string, 10);

    if (!token || !this.authService.verify(token)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  }
}

// Debe configurarse en el módulo
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

// Middleware basado en funciones
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

**Diferencias Clave:**
- **YasuiJS**: Mismos decoradores que los controladores, DI automática, conversión automática de tipos en middleware
- **NestJS**: Patrón diferente a los controladores, extracción manual, requiere configuración de módulo
- **Express**: Basado en funciones, DI manual a través de closures, extracción manual

---

### Manejo de Errores

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Injectable, HttpError } from 'yasui';

@Injectable()
class UserService {
  findUser(id: string) {
    const user = database.find(id);
    if (!user) {
      // Lanzar en cualquier lugar - capturado automáticamente
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
    // No se necesita try-catch - errores manejados automáticamente
    return await this.userService.findUser(id);
  }
}

// Respuesta de error automática:
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
    // Errores capturados automáticamente por NestJS
    return await this.userService.findUser(id);
  }
}

// Respuesta de error automática (similar a YasuiJS)
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
    next(error); // Debe pasar al manejador de errores
  }
});

// Debe definir manejador de errores
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message
  });
});
```

:::

**Diferencias Clave:**
- **YasuiJS**: Captura automática de errores en todas partes, formato de error consistente
- **NestJS**: Captura automática de errores, enfoque similar a YasuiJS
- **Express**: Try-catch manual, debe pasar errores a next(), necesita manejador de errores personalizado

---

### Documentación Swagger/OpenAPI

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

// Configuración del servidor
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
// Swagger UI disponible en /docs
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

// En main.ts
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

// Configuración de Swagger
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

**Diferencias Clave:**
- **YasuiJS**: Basado en decoradores, formatos de definición flexibles, auto-registro
- **NestJS**: Basado en decoradores, similar a YasuiJS, sintaxis de objeto verbosa
- **Express**: Comentarios JSDoc o JSON manual, separado del código

## Benchmarks de Rendimiento

Node.js v22 con Windows 11. Todos los frameworks implementan funcionalidad idéntica.

### Configuración de Prueba

Una API REST realista con:
- **3 Controladores**: User, Product, Order
- **9 Endpoints**: Listar recursos, obtener por ID, filtrar por categoría/usuario/estado
- **Middleware Global**: Middleware de logging en todas las rutas
- **Inyección de Dependencias**: Servicios inyectados en controladores
- **Prueba de Carga**: 10 conexiones concurrentes, 10 segundos por endpoint

### Comparación de Tamaño de Bundle

Huella total incluyendo node_modules y build de producción:

| Framework | node_modules | Build de Producción | Total |
|-----------|--------------|---------------------|-------|
| **YasuiJS** 🏆 | **25.02 MB** | **5.99 KB** | **25.03 MB** |
| Express | 27.04 MB | 2.87 KB | 27.04 MB |
| NestJS | 34.88 MB | 7.07 KB | 34.88 MB |

**YasuiJS es 7.4% más pequeño que Express y 28.2% más pequeño que NestJS.**

### Rendimiento en Tiempo de Ejecución

| Métrica | YasuiJS | NestJS | Express |
|---------|---------|--------|---------|
| **Requests/sec** 🚀 | **5,157** 🏆 | 4,508 | 4,920 |
| **Latencia Promedio** | **1.45ms** 🏆 | 1.72ms | 1.51ms |
| **Arranque en Frío** | 472ms | 915ms | 252ms 🏆 |
| **Uso de Memoria** | **10.66 MB** 🏆 | 16.48 MB | 12.68 MB |

### Hallazgos Clave

- ✅ **YasuiJS es 4.8% más rápido que Express**
- ✅ **YasuiJS es 14.4% más rápido que NestJS** en todos los endpoints
- ✅ **YasuiJS usa 16% menos memoria que Express**
- ✅ **YasuiJS usa 35% menos memoria que NestJS**

**Por qué YasuiJS Escala Mejor:**
- **Router Radix3**: Coincidencia eficiente de rutas para múltiples endpoints
- **Cache de DI**: Dependencias resueltas una vez y cacheadas
- **Metadatos de Decoradores**: Pre-computados al inicio, no por request
- **Middleware Optimizado**: Pipeline basado en promesas con overhead mínimo

Mientras más compleja se vuelve tu API, más brillan las ventajas de arquitectura de YasuiJS.

::: details Rendimiento Detallado por Endpoint

#### GET /users (Listar todos los usuarios)
| Framework | Requests/sec | Latencia Promedio | Latencia P99 |
|-----------|--------------|-------------------|--------------|
| **YasuiJS** | **5,084** 🏆 | 1.47ms | 8ms |
| NestJS | 4,603 | 1.63ms | 8ms |
| Express | 4,401 | 1.75ms | 10ms |

#### GET /products/:id (Obtener por ID con conversión de tipos)
| Framework | Requests/sec | Latencia Promedio | Latencia P99 |
|-----------|--------------|-------------------|--------------|
| **YasuiJS** | **5,352** 🏆 | 1.10ms | 6ms |
| NestJS | 4,643 | 1.31ms | 7ms |
| Express | 4,954 | 1.18ms | 9ms |

#### GET /orders/user/:userId (Rutas anidadas)
| Framework | Requests/sec | Latencia Promedio | Latencia P99 |
|-----------|--------------|-------------------|--------------|
| **YasuiJS** | **5,389** 🏆 | 1.08ms | 6ms |
| NestJS | 4,011 | 1.89ms | 9ms |
| Express | 4,968 | 1.23ms | 8ms |

:::

## ¿Cuándo deberías elegir YasuiJS?

**🏆 Elige YasuiJS** si quieres:
- **El mejor rendimiento en tiempo de ejecución**
- **El tamaño de bundle más pequeño**
- **La menor huella de memoria**
- DX moderno impulsado por decoradores como NestJS
- Instalación ligera y arranques en frío rápidos
- Despliegue multi-runtime (Node.js, Deno, Bun, edge runtimes)
- Conversión automática de tipos sin pipes o configuración
- Patrones consistentes en controladores, middleware y servicios

**Elige NestJS** si necesitas:
- GraphQL, microservicios, WebSockets listos para usar
- Ecosistema extenso de plugins (Passport, TypeORM, etc.)
- Características empresariales probadas en batalla
- Comunidad grande y documentación extensa

**Elige Express** si prefieres:
- Estilo de programación funcional sobre basado en clases
- Ecosistema existente grande de Express y middleware
- Abstracción mínima sobre HTTP de Node.js