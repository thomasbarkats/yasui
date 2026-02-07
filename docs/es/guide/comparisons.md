# Comparaciones de Frameworks

¿Te encanta la arquitectura impulsada por decoradores de NestJS pero construyes APIs REST? **YasuiJS te ofrece la misma experiencia elegante—25% más rápido, sin bloat, en Estándares Web modernos.**

## ¿Por qué YasuiJS sobre NestJS?

La mayoría de los backends son APIs REST. No necesitas GraphQL, WebSockets o características de microservicios—**necesitas controladores limpios, inyección de dependencias y velocidad.** Eso es exactamente lo que YasuiJS ofrece.

YasuiJS **mantiene todas las buenas partes de NestJS:**

**Patrones familiares:**
- ✅ Decoradores: `@Controller`, `@Get`, `@Post`, `@Injectable`, `@Inject`
- ✅ Inyección de dependencias con resolución automática
- ✅ Arquitectura basada en clases con TypeScript primero
- ✅ Generación automática de Swagger/OpenAPI

**Pero refinado:**
- 🎯 **Sin boilerplate de módulos** - Solo controladores y servicios
- 🎯 **Conversión de tipos automática** - Funciona en todas partes, cero configuración
- 🎯 **Patrones consistentes** - Mismos decoradores en controladores y middlewares
- 🎯 **DI Flexible** - Permite inyecciones asíncronas diferidas
- 🎯 **Multi-runtime** - Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge

### Estándares Web: La Elección Moderna

**YasuiJS** está construido sobre **Estándares Web (SRVX)**:
- Despliega en Node.js, Deno, Bun, runtimes edge
- Usa Fetch API, Request/Response nativos
- Listo para edge para serverless y computación distribuida
- Arquitectura a prueba de futuro que evoluciona con la plataforma

**NestJS** está construido sobre **Express** (HTTP Node.js 2010):
- Solo Node.js, no puede ejecutarse en Deno, Bun o edge
- Arquitectura HTTP legacy, incompatible con runtimes modernos
- Las capas de abstracción añaden peso y latencia

### La Ventaja de Rendimiento

**YasuiJS es 25% más rápido que NestJS.**

| Aspecto | YasuiJS | NestJS |
|---------|---------|--------|
| **Enfoque** | APIs REST (dominado) | Todo (comprensivo) |
| **Filosofía** | Minimalista, preciso | Baterías incluidas |
| **Tamaño del Bundle** | Ligero | Rico en características |
| **Arranque en Frío** | Rápido (optimizado serverless) | Más lento (más características para cargar) |
| **Runtime** | Multi-runtime (Node, Deno, Bun, edge) | Enfoque Node.js |
| **Fundación** | Estándares Web (moderno) | Express (legacy) |

Cuando solo envías lo que necesitas, todo se vuelve más rápido. **YasuiJS no incluye GraphQL, WebSockets o CQRS**—y si no los necesitas, **¿por qué pagar el costo de rendimiento?**

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
    @Param('id') id: number,                // Convertido automáticamente a número
    @Query('include') include: boolean,     // Convertido automáticamente a booleano
    @Query('tags', [String]) tags: string[] // Soporte para arrays
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

### Inicialización Diferida de Dependencias

YasuiJS permite inyecciones asíncronas no bloqueantes con `deferred: true` si es necesario. La dependencia se inicializa en segundo plano y, por lo tanto, puede ser null. Puede manejar errores en la fábrica (por ejemplo, enviar una alerta interna) y proporcionar comportamiento de respaldo en los servicios que usan la dependencia.

NestJS no permite esto.

Vea un ejemplo completo en la documentación de [Inyección de Dependencias](/reference/dependency-injection#deferred-deps).

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
- **Inyección de Dependencias**: Servicios inyectados en controladores

### Rendimiento en Tiempo de Ejecución

#### Carga Ligera (10 conexiones concurrentes, 10s por endpoint)

| Métrica | YasuiJS | Express | NestJS |
|---------|---------|---------|--------|
| **Requests/sec** 🚀 | **7,209** 🏆 | 6,602 | 5,695 |
| **Latencia Promedio** | **0.91ms** 🏆 | 1.07ms | 1.26ms |
| **Arranque en Frío** | 280ms | 229ms 🏆 | 568ms |

**Hallazgos Clave:**
- ✅ **YasuiJS es casi 10% más rápido que Express**
- ✅ **YasuiJS es más de 25% más rápido que NestJS**

#### Carga Pesada (100 conexiones concurrentes, 30s por endpoint)

| Métrica | YasuiJS | Express | NestJS |
|---------|---------|---------|--------|
| **Requests/sec** 🚀 | **6,951** 🏆 | 6,755 | 5,492 |
| **Latencia Promedio** | **13.89ms** 🏆 | 14.31ms | 17.72ms |
| **Arranque en Frío** | 256ms | 225ms 🏆 | 595ms |

**Hallazgos Clave:**
- ✅ **YasuiJS es más de 25% más rápido que NestJS**

**Por qué YasuiJS Escala Mejor:**
- **Router Radix3**: Coincidencia eficiente de rutas para múltiples endpoints
- **Cache de DI**: Dependencias resueltas una vez y cacheadas
- **Metadatos de Decoradores**: Pre-computados al inicio, no por request
- **Middleware Optimizado**: Pipeline basado en promesas con overhead mínimo

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

## Guía de Decisión: ¿Qué Framework?

### ✅ Elige YasuiJS si:

**Estás construyendo solo APIs REST**
- No necesitas GraphQL, WebSockets o características de microservicios
- Quieres el patrón decorador/DI sin la complejidad empresarial
- Valoras la simplicidad y el rendimiento sobre características completas

**Quieres dependencias mínimas**
- El tamaño del bundle importa (despliegues serverless, edge)
- Los arranques en frío rápidos son críticos
- Prefieres integrar bibliotecas tú mismo vs. soluciones proporcionadas por el framework

**Necesitas soporte multi-runtime**
- Desplegar en Node.js, Deno, Bun o runtimes edge (Cloudflare Workers, Vercel Edge)
- Arquitectura a prueba de futuro basada en Estándares Web
- No bloqueado en el ecosistema Node.js

**Te gusta la DX de NestJS pero lo encuentras demasiado pesado**
- Aprecias decoradores, DI y patrones basados en clases
- No necesitas todas las características integradas que NestJS proporciona
- Prefieres "trae tus propias bibliotecas" sobre integraciones opinadas

**Perfecto para:**
- APIs REST simples a medianas
- APIs desplegadas serverless/edge
- Nuevos proyectos que pueden necesitar ejecutarse en múltiples runtimes
- Equipos que valoran simplicidad y control sobre conveniencia
- Aplicaciones críticas en rendimiento donde cada milisegundo cuenta

---

### ✅ Elige NestJS si:

**Necesitas más que APIs REST**
- GraphQL, WebSockets, microservicios, Server-Sent Events
- CQRS, Event Sourcing, colas de mensajes
- Múltiples capas de transporte (TCP, gRPC, MQTT, etc.)

**Quieres baterías incluidas**
- Integraciones pre-construidas: Passport, TypeORM, Prisma, Bull, Redis
- Estructura opinada para equipos grandes y aplicaciones complejas
- Menos decisiones sobre arquitectura y bibliotecas

**Necesitas características empresariales**
- Patrones establecidos para aplicaciones monolíticas
- Documentación extensa y recursos de aprendizaje
- Gran comunidad (100k+ desarrolladores) y soporte comercial
- Probado en producción a escala

**Estás construyendo aplicaciones complejas**
- Múltiples servicios interconectados
- Necesidad de patrones avanzados (interceptors, guards, pipes, filters)
- Equipos grandes que requieren directrices arquitectónicas estrictas

**Perfecto para:**
- Aplicaciones empresariales con muchas partes móviles
- Backends completos con diversos protocolos de transporte
- Equipos que prefieren soluciones proporcionadas por el framework
- Proyectos donde el tiempo de comercialización importa más que el tamaño del bundle
- Organizaciones que requieren soluciones maduras y probadas

---

### 🤔 Elige Express si:

**Quieres control completo**
- Framework mínimo, flexibilidad máxima
- Construye tu propia arquitectura desde cero
- Sin decoradores, sin DI, puro JavaScript/TypeScript funcional

**Tienes middleware existente**
- Gran ecosistema de middleware Express (aunque muchos no funcionarán en runtimes edge)
- Patrones maduros y bien entendidos
- Comunidad enorme y recursos

**Perfecto para:**
- APIs simples o microservicios
- Equipos cómodos con patrones funcionales
- Proyectos que requieren flexibilidad máxima
- Cuando quieres aprender fundamentos HTTP

---

### 💡 La Verdad Honesta

**YasuiJS es una herramienta enfocada para APIs REST.** No intentamos ser todo para todos.

- Si necesitas **solo APIs REST** → YasuiJS te ofrece excelente DX con peso mínimo
- Si necesitas **GraphQL, WebSockets, microservicios** → Usa NestJS
- Si necesitas **flexibilidad máxima** → Usa Express

**No hay "ganador"** - solo diferentes herramientas para diferentes trabajos. Elige según lo que realmente estés construyendo.