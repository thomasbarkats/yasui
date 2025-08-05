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
import { Middleware } from 'yasui';

@Middleware()
export class LoggingMiddleware {
  use() {
    console.log('Request received');
  }
}
```

## Middlewares basés sur des classes

### Décorateur Middleware

Le décorateur `@Middleware()` marque une classe comme middleware. La classe doit implémenter une méthode `use()`. Vous pouvez optionnellement implémenter l'interface `IMiddleware` fournie par YasuiJS pour imposer la signature de la méthode.

```typescript
import { Middleware, IMiddleware, Request, Response, Req, Res } from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const token = req.headers.authorization;
    
    if (!token) {
      return res.status(401).json({ error: 'Non autorisé' });
    }
    // Logique de validation du token ici

    // Continuera vers le prochain middleware ou la logique du contrôleur si vous ne retournez rien/void
  }
}
```

### Décorateurs de paramètres dans les Middlewares

Les middlewares peuvent utiliser les mêmes décorateurs de paramètres que les contrôleurs et bénéficier également de la capture automatique des erreurs :

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new HttpError(400, 'Données de requête invalides');
    }
  }

  private isValid(data: any): boolean {
    // Logique de validation
    return true;
  }
}
```

### Injection de dépendances

Comme les classes Middleware agissent comme des Contrôleurs, elles permettent également l'injection de dépendances de la même manière :

```typescript
@Middleware()
export class LoggingMiddleware {
  constructor (
    private validationService: ValidationService, // Injection standard
    @Inject('CONFIG') private config: AppConfig, // Injection personnalisée pré-enregistrée
  ) {}

  use(
    @Body() body: any,
    @Inject() anotherService: AnotherService, // Pareil au niveau de la méthode
  ) {
    if (!this.validationService.isValid(body)) {
      throw new HttpError(400, 'Données de requête invalides');
    }
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

Appliqué à toutes les routes d'un contrôleur spécifique :

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

### Niveau Point de terminaison

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