# Middlewares

Les middlewares traitent les requêtes dans un pipeline avant qu'elles n'atteignent vos contrôleurs. Ils gèrent les préoccupations transversales comme l'authentification, la journalisation, la validation et la transformation des requêtes.

## Aperçu

YasuiJS prend en charge deux types de middlewares :
- **Middlewares basés sur des classes** utilisant le décorateur `@Middleware()`
- **Fonctions RequestHandler d'Express** pour la compatibilité avec les middlewares Express existants

Les middlewares peuvent être appliqués à trois niveaux avec différentes priorités d'exécution :
1. **Niveau application** - Appliqué à toutes les requêtes
2. **Niveau contrôleur** - Appliqué à toutes les routes d'un contrôleur
3. **Niveau point de terminaison** - Appliqué à des routes spécifiques

```typescript
import { Middleware, NextFunction } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use(@Next() next: NextFunction) {
    console.log('Request received');
    next();
  }
}
```

## Middlewares basés sur des classes

### Décorateur Middleware

- `@Middleware()` - Marque une classe comme middleware (pas de paramètres)

Le décorateur `@Middleware()` définit une classe comme middleware. La classe doit implémenter une méthode `use()`. Vous pouvez éventuellement implémenter l'interface `IMiddleware` fournie par YasuiJS pour imposer la signature de la méthode.

```typescript
import { Middleware, IMiddleware, Req, Res, Next } from 'yasui';
import { Request, Response, NextFunction } from 'express';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Validate token logic here
    next(); // Continue to next middleware or controller
  }
}
```

### Décorateurs de paramètres dans les middlewares

Les middlewares peuvent utiliser les mêmes décorateurs de paramètres que les contrôleurs :

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string,
    @Next() next: NextFunction
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new Error('Invalid request data');
    }
    
    next();
  }
  
  private isValid(data: any): boolean {
    // Validation logic
    return true;
  }
}
```

### Exécution des middlewares

Vous devez explicitement appeler `next()` pour continuer vers le middleware ou le contrôleur suivant. Pour arrêter le pipeline de requêtes, vous pouvez soit :
- Renvoyer une réponse en utilisant `@Res()`
- Lancer une erreur
- Ne pas appeler `next()`

```typescript
@Middleware()
export class ConditionalMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    if (req.path === '/public') {
      next(); // Continue pipeline
    }
    // Don't call next() to stop here
  }
}
```

## Middlewares RequestHandler d'Express

Vous pouvez utiliser directement les fonctions middleware standard d'Express :

```typescript
import cors from 'cors';
import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

// Function middleware
function customMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`${req.method} ${req.path}`);
  next();
}

// Function that returns middleware
function rateLimiter(maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Rate limiting logic
    next();
  };
}

yasui.createServer({
  middlewares: [
    cors(),
    helmet(),
    customMiddleware,
    rateLimiter(100)
  ]
});
```

## Niveaux d'utilisation des middlewares

### Niveau application

Appliqué à toutes les requêtes dans l'ensemble de votre application :

```typescript
import yasui from 'yasui';
import { LoggingMiddleware, SecurityMiddleware } from './middleware';

yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, SecurityMiddleware]
});
```

### Niveau contrôleur

Appliqué à toutes les routes au sein d'un contrôleur spécifique :

```typescript
import { AuthMiddleware, ValidationMiddleware } from './middleware';

// Single middleware
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // All routes require authentication
}

// Multiple middlewares
@Controller('/api/admin', AuthMiddleware, ValidationMiddleware)
export class AdminController {
  // All routes have auth + validation
}
```

### Niveau point de terminaison

Appliqué uniquement à des routes spécifiques :

```typescript
import { AuthMiddleware, ValidationMiddleware } from './middleware';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // No middleware
  }
  
  @Post('/', ValidationMiddleware)
  createUser() {
    // Only validation middleware
  }
  
  @Delete('/:id', AuthMiddleware, ValidationMiddleware)
  deleteUser() {
    // Both auth and validation middlewares
  }
}
```

## Ordre d'exécution

Les middlewares s'exécutent dans cet ordre :

1. **Middlewares d'application** (dans l'ordre d'enregistrement)
2. **Middlewares de contrôleur** (dans l'ordre de déclaration)
3. **Middlewares de point de terminaison** (dans l'ordre de déclaration)
4. **Méthode du contrôleur**

```typescript
// Execution order example:
yasui.createServer({
  middlewares: [GlobalMiddleware] // 1. First
});

@Controller('/users', ControllerMiddleware) // 2. Second
export class UserController {
  @Post('/', EndpointMiddleware) // 3. Third
  createUser() {
    // 4. Finally the controller method
  }
}
```