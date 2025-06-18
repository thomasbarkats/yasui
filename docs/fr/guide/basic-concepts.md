# Concepts de base

Cette page couvre les concepts fondamentaux de YasuiJS que vous devez comprendre pour construire des applications efficaces. Nous explorerons l'architecture, les composants principaux et comment ils interagissent ensemble.

## Vue d'ensemble de l'architecture

YasuiJS suit une architecture en couches qui sépare clairement les responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Controllers │  │  Services   │  │ Middleware  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Framework Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Routing   │  │ Dependency  │  │   Error     │        │
│  │             │  │ Injection   │  │  Handling   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Express.js Layer                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Server    │  │   Routing   │  │ Middleware  │        │
│  │             │  │             │  │   Chain     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Contrôleurs

Les contrôleurs sont le point d'entrée principal de votre application. Ils gèrent les requêtes HTTP et retournent les réponses appropriées.

### Qu'est-ce qu'un contrôleur ?

Un contrôleur est une classe TypeScript décorée avec `@Controller()` qui contient des méthodes pour gérer différents types de requêtes HTTP. Chaque méthode correspond à un endpoint de votre API.

```typescript
@Controller('/api/users')
export class UserController {
  
  @Get('/')
  getAllUsers() {
    // Logique pour obtenir tous les utilisateurs
  }

  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    // Logique pour créer un utilisateur
  }
}
```

### Responsabilités d'un contrôleur

1. **Réception des requêtes** : Recevoir les requêtes HTTP entrantes
2. **Validation des données** : Valider les paramètres, corps de requête, etc.
3. **Délégation aux services** : Appeler les services appropriés pour la logique métier
4. **Retour des réponses** : Retourner les réponses HTTP appropriées

### Bonnes pratiques pour les contrôleurs

- **Gardez-les minces** : Les contrôleurs ne doivent contenir que la logique de routage
- **Utilisez l'injection de dépendances** : Injectez les services plutôt que de les instancier
- **Gérez les erreurs** : Utilisez try-catch ou laissez les erreurs remonter pour une gestion centralisée
- **Validez les entrées** : Utilisez les décorateurs de paramètres pour la validation

```typescript
@Controller('/api/users')
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/')
  async getAllUsers(@Query('page') page: number = 1) {
    try {
      return await this.userService.getAllUsers(page);
    } catch (error) {
      // Gestion d'erreur appropriée
      throw new HttpError(500, 'Erreur lors de la récupération des utilisateurs');
    }
  }
}
```

## Services

Les services contiennent la logique métier de votre application. Ils sont injectables et peuvent être partagés entre plusieurs contrôleurs.

### Qu'est-ce qu'un service ?

Un service est une classe décorée avec `@Injectable()` qui contient la logique métier. Les services sont gérés par le conteneur d'injection de dépendances de YasuiJS.

```typescript
@Injectable()
export class UserService {
  
  async getAllUsers(page: number = 1): Promise<User[]> {
    // Logique métier pour récupérer les utilisateurs
    return await this.database.find('users', { page });
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    // Logique métier pour créer un utilisateur
    return await this.database.create('users', userData);
  }
}
```

### Avantages des services

1. **Réutilisabilité** : Un service peut être utilisé par plusieurs contrôleurs
2. **Testabilité** : Facile à mocker et tester en isolation
3. **Séparation des responsabilités** : Logique métier séparée de la logique de routage
4. **Injection de dépendances** : Gestion automatique des dépendances

### Patterns de service courants

**Service de base de données** :
```typescript
@Injectable()
export class DatabaseService {
  async find(collection: string, query: any) {
    // Logique de base de données
  }
}

@Injectable()
export class UserService {
  constructor(private db: DatabaseService) {}
  
  async getAllUsers() {
    return await this.db.find('users', {});
  }
}
```

**Service de validation** :
```typescript
@Injectable()
export class ValidationService {
  validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
```

## Injection de dépendances

L'injection de dépendances (DI) est un pattern qui permet de fournir des dépendances à une classe sans qu'elle ait besoin de les créer elle-même.

### Comment ça fonctionne

YasuiJS utilise un conteneur DI qui :
1. Crée des instances de services
2. Gère leur cycle de vie
3. Les injecte automatiquement dans les constructeurs

```typescript
@Injectable()
export class EmailService {
  sendEmail(to: string, subject: string) {
    // Logique d'envoi d'email
  }
}

@Injectable()
export class UserService {
  constructor(private emailService: EmailService) {}
  
  async createUser(userData: CreateUserDto) {
    const user = await this.database.create('users', userData);
    await this.emailService.sendEmail(user.email, 'Bienvenue !');
    return user;
  }
}

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
}
```

### Scopes de service

YasuiJS supporte différents scopes pour les services :

- **Singleton** (par défaut) : Une seule instance pour toute l'application
- **Request** : Une nouvelle instance pour chaque requête
- **Transient** : Une nouvelle instance à chaque injection

```typescript
@Injectable({ scope: 'request' })
export class RequestScopedService {
  // Nouvelle instance pour chaque requête
}

@Injectable({ scope: 'transient' })
export class TransientService {
  // Nouvelle instance à chaque injection
}
```

## Middleware

Les middlewares sont des fonctions qui s'exécutent avant ou après le traitement d'une requête. Ils peuvent modifier la requête, la réponse, ou terminer le cycle de requête.

### Types de middleware

**Middleware global** : S'applique à toutes les requêtes
```typescript
const app = new YasuiApp({
  middleware: [loggingMiddleware, corsMiddleware]
});
```

**Middleware de contrôleur** : S'applique à toutes les routes d'un contrôleur
```typescript
@Controller('/api/admin')
@Middleware([authMiddleware, adminMiddleware])
export class AdminController {
  // Toutes les routes nécessitent une authentification et des privilèges admin
}
```

**Middleware de route** : S'applique à une route spécifique
```typescript
@Get('/sensitive-data')
@Middleware([rateLimitMiddleware])
getSensitiveData() {
  // Cette route a une limitation de débit
}
```

### Création de middleware personnalisé

```typescript
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }
  
  // Vérifier le token
  try {
    const user = verifyToken(token);
    req.user = user; // Ajouter l'utilisateur à la requête
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}
```

## Décorateurs

Les décorateurs sont le cœur de YasuiJS. Ils fournissent une syntaxe déclarative pour configurer vos classes et méthodes.

### Décorateurs de classe

**@Controller(path)** : Définit une classe comme contrôleur
```typescript
@Controller('/api/users')
export class UserController {
  // Méthodes du contrôleur
}
```

**@Injectable(options?)** : Marque une classe comme injectable
```typescript
@Injectable({ scope: 'singleton' })
export class UserService {
  // Logique du service
}
```

### Décorateurs de méthode

**Décorateurs HTTP** : Définissent les routes HTTP
```typescript
@Get('/')
@Post('/')
@Put('/:id')
@Delete('/:id')
@Patch('/:id')
```

**Décorateurs de paramètres** : Extraient les données de requête
```typescript
@Param('id') id: string
@Query('page') page: number
@Body() userData: CreateUserDto
@Header('authorization') token: string
```

**Décorateurs Swagger** : Génèrent la documentation API
```typescript
@ApiOperation('Créer un utilisateur', 'Crée un nouvel utilisateur dans le système')
@ApiResponse(201, 'Utilisateur créé', UserSchema)
@ApiResponse(400, 'Données invalides')
```

### Décorateurs de middleware

**@Middleware(middlewares)** : Applique des middlewares
```typescript
@Middleware([authMiddleware, rateLimitMiddleware])
@Get('/protected')
getProtectedData() {
  // Route protégée
}
```

## Cycle de vie d'une requête

Comprendre le cycle de vie d'une requête vous aide à déboguer et optimiser votre application.

### 1. Réception de la requête
La requête HTTP arrive sur le serveur Express.js

### 2. Middleware global
Les middlewares globaux s'exécutent dans l'ordre défini

### 3. Routage
YasuiJS trouve le contrôleur et la méthode appropriés

### 4. Middleware de contrôleur
Les middlewares du contrôleur s'exécutent

### 5. Middleware de route
Les middlewares spécifiques à la route s'exécutent

### 6. Extraction des paramètres
Les décorateurs de paramètres extraient et valident les données

### 7. Exécution de la méthode
La méthode du contrôleur s'exécute avec les paramètres injectés

### 8. Gestion des erreurs
Si une erreur se produit, elle est gérée par le middleware d'erreur

### 9. Middleware de réponse
Les middlewares de réponse s'exécutent (dans l'ordre inverse)

### 10. Envoi de la réponse
La réponse HTTP est envoyée au client

```typescript
// Exemple de cycle de vie complet
@Controller('/api/users')
@Middleware([loggingMiddleware])
export class UserController {
  
  @Get('/:id')
  @Middleware([cacheMiddleware])
  async getUser(@Param('id') id: string) {
    // 1. loggingMiddleware s'exécute
    // 2. cacheMiddleware s'exécute
    // 3. Param('id') extrait l'ID
    // 4. Cette méthode s'exécute
    // 5. La réponse est mise en cache
    // 6. loggingMiddleware finalise
    return await this.userService.getUserById(id);
  }
}
```

## Gestion d'erreurs

YasuiJS fournit un système de gestion d'erreurs robuste qui s'intègre avec Express.js.

### Types d'erreurs

**Erreurs HTTP** : Erreurs avec codes de statut HTTP
```typescript
throw new HttpError(404, 'Utilisateur non trouvé');
throw new HttpError(400, 'Données invalides');
```

**Erreurs de validation** : Erreurs de validation de données
```typescript
throw new ValidationError('Email invalide');
```

**Erreurs internes** : Erreurs de serveur
```typescript
throw new InternalServerError('Erreur de base de données');
```

### Gestion centralisée des erreurs

```typescript
// Middleware de gestion d'erreurs personnalisé
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode
    });
  }
  
  // Erreur inattendue
  console.error('Erreur inattendue:', error);
  return res.status(500).json({
    error: 'Erreur interne du serveur',
    statusCode: 500
  });
}
```

## Configuration

YasuiJS utilise un système de configuration flexible qui permet de personnaliser le comportement de votre application.

### Configuration de base

```typescript
const app = new YasuiApp({
  port: 3000,
  debug: true,
  cors: true,
  middleware: [loggingMiddleware],
  errorHandler: customErrorHandler
});
```

### Variables d'environnement

```typescript
const app = new YasuiApp({
  port: process.env.PORT || 3000,
  debug: process.env.NODE_ENV === 'development',
  cors: {
    origin: process.env.CORS_ORIGIN || '*'
  }
});
```

### Configuration avancée

```typescript
const app = new YasuiApp({
  port: 3000,
  debug: true,
  cors: {
    origin: ['http://localhost:3000', 'https://myapp.com'],
    credentials: true
  },
  middleware: [loggingMiddleware, corsMiddleware],
  errorHandler: customErrorHandler,
  swagger: {
    enabled: true,
    path: '/api-docs',
    title: 'Mon API',
    version: '1.0.0'
  }
});
```

## Bonnes pratiques

### Structure de projet

```
src/
├── controllers/
│   ├── user.controller.ts
│   └── auth.controller.ts
├── services/
│   ├── user.service.ts
│   ├── auth.service.ts
│   └── email.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── validation.middleware.ts
├── types/
│   ├── user.types.ts
│   └── auth.types.ts
├── utils/
│   └── helpers.ts
└── app.ts
```

### Naming conventions

- **Contrôleurs** : `*.controller.ts`
- **Services** : `*.service.ts`
- **Middleware** : `*.middleware.ts`
- **Types** : `*.types.ts` ou `*.dto.ts`

### Séparation des responsabilités

- **Contrôleurs** : Gestion des requêtes HTTP uniquement
- **Services** : Logique métier et accès aux données
- **Middleware** : Traitement transversal (auth, logging, etc.)
- **Types** : Définitions TypeScript et validation

### Gestion des erreurs

- Utilisez des types d'erreur appropriés
- Loggez les erreurs pour le débogage
- Retournez des messages d'erreur appropriés aux clients
- Utilisez des codes de statut HTTP corrects

### Performance

- Utilisez des services singleton pour les ressources coûteuses
- Mettez en cache les données fréquemment accédées
- Utilisez la pagination pour les grandes listes
- Optimisez les requêtes de base de données

Ces concepts fondamentaux constituent la base de toute application YasuiJS. Une fois que vous les maîtrisez, vous pouvez construire des applications robustes et maintenables. 