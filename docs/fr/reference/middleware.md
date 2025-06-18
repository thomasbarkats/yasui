# Guide des middlewares

## Vue d'ensemble

Les middlewares dans YasuiJS sont des fonctions qui s'exécutent avant ou après le traitement d'une requête. Ils peuvent modifier la requête, la réponse, ou terminer le cycle de requête.

## Types de middleware

### Middleware global
Appliqué à toutes les requêtes de l'application.

```typescript
const app = new YasuiApp({
  middleware: [loggingMiddleware, corsMiddleware]
});
```

### Middleware de contrôleur
Appliqué à toutes les routes d'un contrôleur.

```typescript
@Controller('/api/admin')
@Middleware([authMiddleware, adminMiddleware])
export class AdminController {
  // Toutes les routes nécessitent auth + admin
}
```

### Middleware de route
Appliqué à une route spécifique.

```typescript
@Get('/sensitive-data')
@Middleware([rateLimitMiddleware])
getSensitiveData() {
  // Cette route a une limitation de débit
}
```

## Middlewares intégrés

### CORS
Active le partage de ressources cross-origin.

```typescript
const app = new YasuiApp({
  cors: true // Configuration par défaut
});

// Configuration personnalisée
const app = new YasuiApp({
  cors: {
    origin: ['http://localhost:3000', 'https://myapp.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
```

### Logging
Journalisation automatique des requêtes.

```typescript
const app = new YasuiApp({
  debug: true // Active la journalisation détaillée
});
```

## Création de middleware personnalisé

### Structure de base

```typescript
import { Request, Response, NextFunction } from 'express';

export function customMiddleware(req: Request, res: Response, next: NextFunction) {
  // Logique du middleware
  next(); // Passe au middleware suivant
}
```

### Middleware d'authentification

```typescript
export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }
  
  try {
    const user = verifyToken(token);
    req.user = user; // Ajouter l'utilisateur à la requête
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}
```

### Middleware de validation

```typescript
export function validateUserData(req: Request, res: Response, next: NextFunction) {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Nom et email requis' });
  }
  
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' });
  }
  
  next();
}
```

### Middleware de limitation de débit

```typescript
const rateLimit = new Map();

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100;
  
  const userRequests = rateLimit.get(ip) || [];
  const recentRequests = userRequests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    return res.status(429).json({ error: 'Trop de requêtes' });
  }
  
  recentRequests.push(now);
  rateLimit.set(ip, recentRequests);
  
  next();
}
```

### Middleware de journalisation

```typescript
export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}
```

## Utilisation des middlewares

### Application globale

```typescript
import { loggingMiddleware, corsMiddleware } from './middleware';

const app = new YasuiApp({
  middleware: [loggingMiddleware, corsMiddleware]
});
```

### Contrôleur spécifique

```typescript
@Controller('/api/admin')
@Middleware([authMiddleware, adminMiddleware])
export class AdminController {
  
  @Get('/users')
  getUsers() {
    // Nécessite auth + admin
  }
  
  @Get('/stats')
  @Middleware([rateLimitMiddleware])
  getStats() {
    // Nécessite auth + admin + limitation de débit
  }
}
```

### Route spécifique

```typescript
@Controller('/api/users')
export class UserController {
  
  @Post('/')
  @Middleware([validateUserData])
  createUser(@Body() userData: CreateUserDto) {
    // Validation avant création
  }
  
  @Get('/:id')
  getUser(@Param('id') id: string) {
    // Pas de middleware spécifique
  }
}
```

## Ordre d'exécution

1. Middleware global (dans l'ordre défini)
2. Middleware de contrôleur
3. Middleware de route
4. Méthode du contrôleur
5. Middleware de réponse (ordre inverse)

## Gestion d'erreurs dans les middlewares

### Middleware d'erreur

```typescript
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Erreur:', error);
  
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode
    });
  }
  
  return res.status(500).json({
    error: 'Erreur interne du serveur',
    statusCode: 500
  });
}
```

### Configuration

```typescript
const app = new YasuiApp({
  errorHandler: errorHandler
});
```

## Middlewares tiers

### Helmet (sécurité)

```bash
npm install helmet
```

```typescript
import helmet from 'helmet';

const app = new YasuiApp({
  middleware: [helmet()]
});
```

### Morgan (journalisation)

```bash
npm install morgan
```

```typescript
import morgan from 'morgan';

const app = new YasuiApp({
  middleware: [morgan('combined')]
});
```

### Compression

```bash
npm install compression
```

```typescript
import compression from 'compression';

const app = new YasuiApp({
  middleware: [compression()]
});
```

## Bonnes pratiques

### Performance
- Placez les middlewares coûteux après les middlewares de filtrage
- Utilisez la mise en cache pour les middlewares de validation
- Évitez les opérations synchrones bloquantes

### Sécurité
- Validez toujours les entrées utilisateur
- Utilisez des middlewares de sécurité (helmet, cors)
- Limitez les requêtes pour prévenir les attaques DDoS

### Maintenance
- Gardez les middlewares simples et focalisés
- Documentez les middlewares personnalisés
- Testez les middlewares en isolation

## Exemples complets

### Application avec authentification

```typescript
import { YasuiApp } from 'yasui';
import { authMiddleware, loggingMiddleware } from './middleware';

const app = new YasuiApp({
  middleware: [loggingMiddleware],
  errorHandler: errorHandler
});

@Controller('/api/public')
export class PublicController {
  
  @Get('/')
  getPublicData() {
    return { message: 'Données publiques' };
  }
}

@Controller('/api/private')
@Middleware([authMiddleware])
export class PrivateController {
  
  @Get('/profile')
  getProfile(req: Request) {
    return { user: req.user };
  }
}

app.registerControllers([PublicController, PrivateController]);
```

### Middleware de validation avancé

```typescript
export function validateSchema(schema: any) {
  return function(req: Request, res: Response, next: NextFunction) {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation échouée',
        details: error.details
      });
    }
    
    next();
  };
}

// Utilisation
@Post('/')
@Middleware([validateSchema(createUserSchema)])
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
} 