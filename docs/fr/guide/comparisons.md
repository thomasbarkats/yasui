# Comparaisons de Frameworks

YasuiJS fournit une alternative moderne et légère aux frameworks existants. Cette page compare YasuiJS avec NestJS et Express à travers des cas d'usage courants.

## Philosophie

**YasuiJS** : Architecture basée sur les classes et pilotée par les décorateurs avec des dépendances minimales. **Construit sur les Standards Web avec [SRVX](https://srvx.h3.dev)** pour un véritable support multi-runtime (Node.js, Deno, Bun) et une compatibilité de déploiement edge.

**NestJS** : Framework de niveau entreprise avec des fonctionnalités étendues, architecture inspirée d'Angular. **Construit sur Express** (Node.js uniquement, architecture HTTP traditionnelle).

**Express** : Approche minimaliste et fonctionnelle. Sans opinion et flexible, mais nécessite plus de code standard pour les applications structurées.

## Exemples de Code

### Contrôleur de Base avec Injection de Dépendances

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

// Configuration du serveur
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

// Configuration du serveur
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

```javascript [Express]
const express = require('express');
const app = express();

// Gestion manuelle des dépendances
class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

// Enregistrement manuel des routes
const userService = new UserService();

app.get('/users', (req, res) => {
  const users = userService.getUsers();
  res.json(users);
});

app.listen(3000);
```

:::

**Différences Clés :**
- **YasuiJS** : Construit sur les **Standards Web** avec [SRVX](https://srvx.h3.dev) → **support multi-runtime** (Node.js, Deno, Bun, Edge). Pas de système de modules nécessaire, résolution automatique de l'ID.
- **NestJS** : Construit sur **Express** → **Node uniquement**, ancienne architecture. Nécessite une déclaration de module avec providers/controllers.
- **Express** : Style fonctionnel, pas d'ID, instanciation manuelle des services et enregistrement des routes.

---

### Paramètres de Route avec Conversion de Type Automatique

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Param, Query } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(
    @Param('id') id: number,           // Automatiquement converti en nombre
    @Query('include') include: boolean, // Automatiquement converti en booléen
    @Query('tags', [String]) tags: string[]  // Support des tableaux
  ) {
    console.log(typeof id);      // 'number'
    console.log(typeof include); // 'boolean'
    console.log(Array.isArray(tags)); // true

    return { id, include, tags };
  }
}

// Aucune configuration supplémentaire nécessaire - fonctionne immédiatement !
```

```typescript [NestJS]
import { Controller, Get, Param, Query, ParseIntPipe, ParseBoolPipe } from '@nestjs/common';
import { Type } from 'class-transformer';

// Besoin de créer des classes DTO pour les types complexes
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
    @Param('id', ParseIntPipe) id: number,  // Doit spécifier le pipe pour chaque param
    @Query() query: GetUserDto               // Ou utiliser DTO avec ValidationPipe
  ) {
    return { id, include: query.include, tags: query.tags };
  }
}

// Doit activer le pipe de validation global dans main.ts
app.useGlobalPipes(new ValidationPipe({ transform: true }));
```

```javascript [Express]
const express = require('express');
const app = express();

app.get('/users/:id', (req, res) => {
  // Analyse manuelle requise
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

**Différences Clés :**
- **YasuiJS** : Conversion de type automatique basée sur les types TypeScript, fonctionne partout y compris dans les middlewares
- **NestJS** : Nécessite des pipes (ParseIntPipe, etc.) ou ValidationPipe global avec des DTOs
- **Express** : Analyse et validation complètement manuelles

---

### Middleware avec Extraction de Paramètres

::: code-group

```typescript [YasuiJS]
import { Middleware, Header, Query, Inject } from 'yasui';

@Middleware()
export class AuthMiddleware {
  constructor(private authService: AuthService) {}

  use(
    @Header('authorization') token: string,
    @Query('apiVersion') version: number,  // La conversion de type fonctionne dans le middleware !
    @Inject() logger: LoggerService
  ) {
    if (!token || !this.authService.verify(token)) {
      throw new HttpError(401, 'Unauthorized');
    }

    logger.log(`Auth success for API v${version}`);
    // Continue automatiquement si aucune erreur n'est lancée
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
    // Extraction manuelle depuis l'objet req
    const token = req.headers['authorization'];
    const version = parseInt(req.query.apiVersion as string, 10);

    if (!token || !this.authService.verify(token)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    next();
  }
}

// Doit configurer dans le module
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

// Middleware basé sur les fonctions
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

**Différences Clés :**
- **YasuiJS** : Mêmes décorateurs que les contrôleurs, ID automatique, conversion de type automatique dans le middleware
- **NestJS** : Modèle différent des contrôleurs, extraction manuelle, nécessite une configuration de module
- **Express** : Basé sur les fonctions, ID manuelle via les closures, extraction manuelle

---

### Gestion des Erreurs

::: code-group

```typescript [YasuiJS]
import { Controller, Get, Injectable, HttpError } from 'yasui';

@Injectable()
class UserService {
  findUser(id: string) {
    const user = database.find(id);
    if (!user) {
      // Lancer n'importe où - automatiquement capturé
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
    // Pas de try-catch nécessaire - erreurs automatiquement gérées
    return await this.userService.findUser(id);
  }
}

// Réponse d'erreur automatique :
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
    // Erreurs automatiquement capturées par NestJS
    return await this.userService.findUser(id);
  }
}

// Réponse d'erreur automatique (similaire à YasuiJS)
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
    next(error); // Doit passer au gestionnaire d'erreurs
  }
});

// Doit définir un gestionnaire d'erreurs
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message
  });
});
```

:::

**Différences Clés :**
- **YasuiJS** : Capture automatique des erreurs partout, format d'erreur cohérent
- **NestJS** : Capture automatique des erreurs, approche similaire à YasuiJS
- **Express** : Try-catch manuel, doit passer les erreurs à next(), gestionnaire d'erreurs personnalisé nécessaire

---

### Documentation Swagger/OpenAPI

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

// Configuration du serveur
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
// Interface Swagger disponible à /docs
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

// Dans main.ts
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

// Configuration Swagger
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

**Différences Clés :**
- **YasuiJS** : Basé sur les décorateurs, formats de définition flexibles, auto-enregistrement
- **NestJS** : Basé sur les décorateurs, similaire à YasuiJS, syntaxe d'objet verbeuse
- **Express** : Commentaires JSDoc ou JSON manuel, séparé du code

## Benchmarks de Performance

Node.js v22 avec Windows 11. Tous les frameworks implémentent des fonctionnalités identiques.

### Configuration de Test

Une API REST réaliste avec :
- **3 Contrôleurs** : User, Product, Order
- **9 Endpoints** : Lister les ressources, obtenir par ID, filtrer par catégorie/utilisateur/statut
- **Middleware Global** : Middleware de logging sur toutes les routes
- **Injection de Dépendances** : Services injectés dans les contrôleurs
- **Test de Charge** : 10 connexions simultanées, 10 secondes par endpoint

### Comparaison de Taille de Bundle

Empreinte totale incluant node_modules et build de production :

| Framework | node_modules | Build de Production | Total |
|-----------|--------------|---------------------|-------|
| **YasuiJS** 🏆 | **25.02 MB** | **5.99 KB** | **25.03 MB** |
| Express | 27.04 MB | 2.87 KB | 27.04 MB |
| NestJS | 34.88 MB | 7.07 KB | 34.88 MB |

**YasuiJS est 7,4% plus petit qu'Express et 28,2% plus petit que NestJS.**

### Performance d'Exécution

| Métrique | YasuiJS | NestJS | Express |
|----------|---------|--------|---------|
| **Requêtes/sec** 🚀 | **5,157** 🏆 | 4,508 | 4,920 |
| **Latence Moy.** | **1.45ms** 🏆 | 1.72ms | 1.51ms |
| **Démarrage à Froid** | 472ms | 915ms | 252ms 🏆 |
| **Utilisation Mémoire** | **10.66 MB** 🏆 | 16.48 MB | 12.68 MB |

### Résultats Clés

- ✅ **YasuiJS est 4,8% plus rapide qu'Express**
- ✅ **YasuiJS est 14,4% plus rapide que NestJS** sur tous les endpoints
- ✅ **YasuiJS utilise 16% moins de mémoire qu'Express**
- ✅ **YasuiJS utilise 35% moins de mémoire que NestJS**

**Pourquoi YasuiJS Évolue Mieux :**
- **Routeur Radix3** : Correspondance de route efficace pour plusieurs endpoints
- **Cache ID** : Dépendances résolues une fois et mises en cache
- **Métadonnées de Décorateur** : Pré-calculées au démarrage, pas par requête
- **Middleware Optimisé** : Pipeline basé sur les promesses avec surcharge minimale

Plus votre API devient complexe, plus les avantages architecturaux de YasuiJS brillent.

::: details Performance Détaillée par Endpoint

#### GET /users (Lister tous les utilisateurs)
| Framework | Requêtes/sec | Latence Moy. | Latence P99 |
|-----------|--------------|--------------|-------------|
| **YasuiJS** | **5,084** 🏆 | 1.47ms | 8ms |
| NestJS | 4,603 | 1.63ms | 8ms |
| Express | 4,401 | 1.75ms | 10ms |

#### GET /products/:id (Obtenir par ID avec conversion de type)
| Framework | Requêtes/sec | Latence Moy. | Latence P99 |
|-----------|--------------|--------------|-------------|
| **YasuiJS** | **5,352** 🏆 | 1.10ms | 6ms |
| NestJS | 4,643 | 1.31ms | 7ms |
| Express | 4,954 | 1.18ms | 9ms |

#### GET /orders/user/:userId (Routes imbriquées)
| Framework | Requêtes/sec | Latence Moy. | Latence P99 |
|-----------|--------------|--------------|-------------|
| **YasuiJS** | **5,389** 🏆 | 1.08ms | 6ms |
| NestJS | 4,011 | 1.89ms | 9ms |
| Express | 4,968 | 1.23ms | 8ms |

:::

## Quand devriez-vous choisir YasuiJS ?

**🏆 Choisissez YasuiJS** si vous voulez :
- **Meilleure performance d'exécution**
- **Plus petite taille de bundle**
- **Empreinte mémoire la plus faible**
- DX moderne pilotée par les décorateurs comme NestJS
- Installation légère et démarrages à froid rapides
- Déploiement multi-runtime (Node.js, Deno, Bun, runtimes edge)
- Conversion de type automatique sans pipes ou configuration
- Modèles cohérents à travers les contrôleurs, middlewares et services

**Choisissez NestJS** si vous avez besoin :
- GraphQL, microservices, WebSockets prêts à l'emploi
- Écosystème de plugins étendu (Passport, TypeORM, etc.)
- Fonctionnalités d'entreprise éprouvées au combat
- Grande communauté et documentation extensive

**Choisissez Express** si vous préférez :
- Style de programmation fonctionnelle plutôt que basé sur les classes
- Écosystème Express existant et middleware
- Abstraction minimale sur Node.js HTTP