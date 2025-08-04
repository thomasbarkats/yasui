# Middlewares

Les middlewares traitent les requêtes dans un pipeline avant qu'elles n'atteignent vos contrôleurs. Ils gèrent les préoccupations transversales comme l'authentification, la journalisation, la validation et la transformation des requêtes.

## Vue d'ensemble

YasuiJS prend en charge deux types de middlewares :
- **Middlewares basés sur des classes** utilisant le décorateur `@Middleware()`
- **Fonctions RequestHandler Express** pour la compatibilité avec les middlewares Express existants

Les middlewares peuvent être appliqués à trois niveaux avec différentes priorités d'exécution :
1. **Niveau application** - Appliqué à toutes les requêtes
2. **Niveau contrôleur** - Appliqué à toutes les routes d'un contrôleur
3. **Niveau point de terminaison** - Appliqué à des routes spécifiques

```typescript
import { Middleware, NextFunction } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use(@Next() next: NextFunction) {
    console.log('Requête reçue');
    next();
  }
}
```

## Middlewares basés sur des classes

### Décorateur Middleware

- `@Middleware()` - Marque une classe comme middleware (pas de paramètres)

Le décorateur `@Middleware()` définit une classe comme middleware. La classe doit implémenter une méthode `use()`. Vous pouvez optionnellement implémenter l'interface `IMiddleware` fournie par YasuiJS pour imposer la signature de la méthode.

```typescript
import {
  Middleware, IMiddleware,
  Request, Response, NextFunction,
  Req, Res, Next,
} from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction
  ) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    // Logique de validation du token ici

    next(); // Continue vers le prochain middleware ou la logique du contrôleur
  }
}
```

### Décorateurs de paramètres dans les Middlewares

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
      throw new Error('Données de requête invalides');
    }
    
    next();
  }
  
  private isValid(data: any): boolean {
    // Logique de validation
    return true;
  }
}
```

### Exécution des Middlewares

Vous devez explicitement appeler `next()` pour continuer vers le prochain middleware ou contrôleur. Pour arrêter le pipeline de requête, vous pouvez soit :
- Retourner une réponse en utilisant `@Res()`
- Lancer une erreur
- Ne pas appeler `next()`

```typescript
@Middleware()
export class ConditionalMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    if (req.path === '/public') {
      next(); // Continue le pipeline
    }
    // Ne pas appeler next() pour arrêter ici
  }
}
```

## Middlewares RequestHandler Express

Vous pouvez utiliser directement les fonctions middleware Express standard :

```typescript
import cors from 'cors';
import helmet from 'helmet';

yasui.createServer({
  middlewares: [
    cors(),
    helmet(),
  ]
});
```

## Niveaux d'utilisation des Middlewares

### Niveau Application

Appliqué à toutes les requêtes dans votre application :

```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, SecurityMiddleware]
});
```

### Niveau Contrôleur

Appliqué à toutes les routes dans un contrôleur spécifique :

```typescript
// Middleware unique
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // Toutes les routes nécessitent une authentification
}

// Plusieurs middlewares
@Controller('/api/admin', AuthMiddleware, ValidationMiddleware)
export class AdminController {
  // Toutes les routes ont auth + validation
}
```

### Niveau Point de Terminaison

Appliqué uniquement à des routes spécifiques :

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // Pas de middleware
  }
  
  @Post('/', ValidationMiddleware)
  createUser() {
    // Uniquement middleware de validation
  }
  
  @Delete('/:id', AuthMiddleware, ValidationMiddleware)
  deleteUser() {
    // Les deux middlewares auth et validation
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
// Exemple d'ordre d'exécution :
yasui.createServer({
  middlewares: [GlobalMiddleware] // 1. Premier
});

@Controller('/users', ControllerMiddleware) // 2. Deuxième
export class UserController {
  @Post('/', EndpointMiddleware) // 3. Troisième
  createUser() {
    // 4. Finalement la méthode du contrôleur
  }
}
```