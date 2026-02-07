# Comparaisons de Frameworks

Vous aimez l'architecture pilotée par les décorateurs de NestJS mais construisez des API REST ? **YasuiJS vous offre la même expérience élégante—25% plus rapide, sans bloat, sur les Standards Web modernes.**

## Pourquoi YasuiJS plutôt que NestJS ?

La plupart des backends sont des API REST. Vous n'avez pas besoin de GraphQL, WebSockets ou de fonctionnalités microservices—**vous avez besoin de contrôleurs propres, d'injection de dépendances et de rapidité.** C'est exactement ce que YasuiJS offre.

YasuiJS **conserve toutes les bonnes parties de NestJS :**

**Patterns familiers :**
- ✅ Décorateurs : `@Controller`, `@Get`, `@Post`, `@Injectable`, `@Inject`
- ✅ Injection de dépendances avec résolution automatique
- ✅ Architecture basée sur les classes avec TypeScript en priorité
- ✅ Génération automatique Swagger/OpenAPI

**Mais raffiné :**
- 🎯 **Pas de boilerplate de modules** - Juste des contrôleurs et des services
- 🎯 **Conversion de type automatique** - Fonctionne partout, zéro configuration
- 🎯 **Patterns cohérents** - Mêmes décorateurs dans les contrôleurs et middlewares
- 🎯 **ID Flexible** - Permet les injections asynchrones différées
- 🎯 **Multi-runtime** - Node.js, Deno, Bun, Cloudflare Workers, Vercel Edge

### Standards Web : Le Choix Moderne

**YasuiJS** est construit sur les **Standards Web (SRVX)** :
- Déployez sur Node.js, Deno, Bun, runtimes edge
- Utilise Fetch API, Request/Response natifs
- Prêt pour l'edge pour le serverless et le computing distribué
- Architecture future-proof qui évolue avec la plateforme

**NestJS** est construit sur **Express** (HTTP Node.js 2010) :
- Node.js uniquement, ne peut pas fonctionner sur Deno, Bun ou edge
- Architecture HTTP legacy, incompatible avec les runtimes modernes
- Les couches d'abstraction ajoutent du poids et de la latence

### L'Avantage Performance

**YasuiJS est 25% plus rapide que NestJS.**

| Aspect | YasuiJS | NestJS |
|--------|---------|--------|
| **Focus** | API REST (maîtrisé) | Tout (compréhensif) |
| **Philosophie** | Minimaliste, précis | Batteries incluses |
| **Taille du Bundle** | Léger | Riche en fonctionnalités |
| **Démarrage à Froid** | Rapide (optimisé serverless) | Plus lent (plus de fonctionnalités à charger) |
| **Runtime** | Multi-runtime (Node, Deno, Bun, edge) | Focus Node.js |
| **Fondation** | Standards Web (moderne) | Express (legacy) |

Quand vous ne livrez que ce dont vous avez besoin, tout devient plus rapide. **YasuiJS n'inclut pas GraphQL, WebSockets ou CQRS**—et si vous n'en avez pas besoin, **pourquoi payer le coût performance ?**

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
    @Param('id') id: number,                // Automatiquement converti en nombre
    @Query('include') include: boolean,     // Automatiquement converti en booléen
    @Query('tags', [String]) tags: string[] // Support des tableaux
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

### Initialisation Différée des Dépendances

YasuiJS permet les injections asynchrones non bloquantes avec `deferred: true` si nécessaire. La dépendance est initialisée en arrière-plan et peut donc être null. Vous pouvez gérer les erreurs dans la factory (par exemple, envoyer une alerte interne) et fournir un comportement de repli dans les services qui utilisent la dépendance.

NestJS ne le permet pas.

Consultez un exemple complet dans la documentation [Injection de Dépendances](/reference/dependency-injection#deferred-deps).

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
- **Injection de Dépendances** : Services injectés dans les contrôleurs

### Performance d'Exécution

#### Charge Légère (10 connexions simultanées, 10s par endpoint)

| Métrique | YasuiJS | Express | NestJS |
|----------|---------|---------|--------|
| **Requêtes/sec** 🚀 | **7,209** 🏆 | 6,602 | 5,695 |
| **Latence Moy.** | **0.91ms** 🏆 | 1.07ms | 1.26ms |
| **Démarrage à Froid** | 280ms | 229ms 🏆 | 568ms |

**Résultats Clés :**
- ✅ **YasuiJS est presque 10% plus rapide qu'Express**
- ✅ **YasuiJS est plus de 25% plus rapide que NestJS**

#### Charge Lourde (100 connexions simultanées, 30s par endpoint)

| Métrique | YasuiJS | Express | NestJS |
|----------|---------|---------|--------|
| **Requêtes/sec** 🚀 | **6,951** 🏆 | 6,755 | 5,492 |
| **Latence Moy.** | **13.89ms** 🏆 | 14.31ms | 17.72ms |
| **Démarrage à Froid** | 256ms | 225ms 🏆 | 595ms |

**Résultats Clés :**
- ✅ **YasuiJS est plus de 25% plus rapide que NestJS**

**Pourquoi YasuiJS Évolue Mieux :**
- **Routeur Radix3** : Correspondance de route efficace pour plusieurs endpoints
- **Cache ID** : Dépendances résolues une fois et mises en cache
- **Métadonnées de Décorateur** : Pré-calculées au démarrage, pas par requête
- **Middleware Optimisé** : Pipeline basé sur les promesses avec surcharge minimale

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

## Guide de Décision : Quel Framework ?

### ✅ Choisissez YasuiJS si :

**Vous construisez uniquement des API REST**
- Vous n'avez pas besoin de GraphQL, WebSockets ou fonctionnalités microservices
- Vous voulez le pattern décorateur/DI sans la complexité enterprise
- Vous valorisez la simplicité et la performance plutôt que les fonctionnalités complètes

**Vous voulez des dépendances minimales**
- La taille du bundle compte (déploiements serverless, edge)
- Les démarrages à froid rapides sont critiques
- Vous préférez intégrer les bibliothèques vous-même plutôt que les solutions fournies par le framework

**Vous avez besoin du support multi-runtime**
- Déployer sur Node.js, Deno, Bun ou runtimes edge (Cloudflare Workers, Vercel Edge)
- Architecture future-proof basée sur les Standards Web
- Pas enfermé dans l'écosystème Node.js

**Vous aimez la DX de NestJS mais le trouvez trop lourd**
- Vous appréciez les décorateurs, DI et patterns basés sur les classes
- Vous n'avez pas besoin de toutes les fonctionnalités intégrées que NestJS fournit
- Vous préférez "apportez vos propres bibliothèques" plutôt que des intégrations opinionnées

**Parfait pour :**
- API REST simples à moyennes
- API déployées serverless/edge
- Nouveaux projets pouvant nécessiter de fonctionner sur plusieurs runtimes
- Équipes valorisant la simplicité et le contrôle plutôt que la commodité
- Applications critiques en performance où chaque milliseconde compte

---

### ✅ Choisissez NestJS si :

**Vous avez besoin de plus que des API REST**
- GraphQL, WebSockets, microservices, Server-Sent Events
- CQRS, Event Sourcing, files de messages
- Plusieurs couches de transport (TCP, gRPC, MQTT, etc.)

**Vous voulez batteries incluses**
- Intégrations pré-construites : Passport, TypeORM, Prisma, Bull, Redis
- Structure opinionnée pour grandes équipes et applications complexes
- Moins de décisions à prendre sur l'architecture et les bibliothèques

**Vous avez besoin de fonctionnalités enterprise**
- Patterns établis pour applications monolithiques
- Documentation extensive et ressources d'apprentissage
- Grande communauté (100k+ développeurs) et support commercial
- Prouvé en production à l'échelle

**Vous construisez des applications complexes**
- Plusieurs services interconnectés
- Besoin de patterns avancés (interceptors, guards, pipes, filters)
- Grandes équipes nécessitant des directives architecturales strictes

**Parfait pour :**
- Applications enterprise avec de nombreuses parties mobiles
- Backends complets avec divers protocoles de transport
- Équipes préférant les solutions fournies par le framework
- Projets où le time-to-market compte plus que la taille du bundle
- Organisations nécessitant des solutions matures et éprouvées

---

### 🤔 Choisissez Express si :

**Vous voulez le contrôle complet**
- Framework minimal, flexibilité maximale
- Construisez votre propre architecture from scratch
- Pas de décorateurs, pas de DI, pur JavaScript/TypeScript fonctionnel

**Vous avez des middlewares existants**
- Large écosystème de middlewares Express (bien que beaucoup ne fonctionneront pas dans les runtimes edge)
- Patterns matures et bien compris
- Communauté énorme et ressources

**Parfait pour :**
- API simples ou microservices
- Équipes à l'aise avec les patterns fonctionnels
- Projets nécessitant une flexibilité maximale
- Quand vous voulez apprendre les fondamentaux HTTP

---

### 💡 La Vérité

**YasuiJS est un outil focalisé pour les API REST.** Nous n'essayons pas d'être tout pour tout le monde.

- Si vous avez besoin **uniquement d'API REST** → YasuiJS vous offre une excellente DX avec un poids minimal
- Si vous avez besoin de **GraphQL, WebSockets, microservices** → Utilisez NestJS
- Si vous avez besoin de **flexibilité maximale** → Utilisez Express

**Il n'y a pas de "gagnant"** - juste différents outils pour différents jobs. Choisissez en fonction de ce que vous construisez réellement.