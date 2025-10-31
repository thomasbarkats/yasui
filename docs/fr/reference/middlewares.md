# Middlewares

Les middlewares traitent les requêtes dans un pipeline avant qu'elles n'atteignent vos contrôleurs. Ils gèrent les préoccupations transversales comme l'authentification, la journalisation, la validation et la transformation des requêtes.

## Vue d'ensemble

YasuiJS utilise des **middlewares basés sur des classes** avec le décorateur `@Middleware()`. Les middlewares sont construits sur les standards Web et fonctionnent sur tous les runtimes supportés (Node.js, Deno, Bun).

**Important** : YasuiJS 4.x utilise les Request/Response des standards Web au lieu d'Express. Les middlewares de style Express (comme `cors`, `helmet`, etc.) ne sont **pas compatibles**. Utilisez des alternatives compatibles avec les standards Web ou écrivez des middlewares YasuiJS natifs.

Les middlewares peuvent être appliqués à trois niveaux avec différentes priorités d'exécution :
1. **Niveau application** - Appliqué à toutes les requêtes
2. **Niveau contrôleur** - Appliqué à toutes les routes d'un contrôleur
3. **Niveau endpoint** - Appliqué à des routes spécifiques

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

Le décorateur `@Middleware()` marque une classe comme middleware. La classe doit implémenter une méthode `use()`. Vous pouvez optionnellement implémenter l'interface `IMiddleware` fournie par YasuiJS pour imposer la signature de méthode.

```typescript
import { Middleware, IMiddleware, Request, Req } from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(@Req() req: Request) {
    const token = req.headers.authorization;

    if (!token) {
      throw new HttpError(401, 'Unauthorized');
    }
    // Logique de validation du token ici

    // Continuera vers le middleware suivant ou le contrôleur si vous ne retournez rien/void
  }
}
```

**Note :** Les middlewares fonctionnent comme les méthodes de contrôleur - vous pouvez retourner des valeurs, lever des erreurs, ou ne rien retourner pour continuer. Utiliser `@Next()` est optionnel si vous avez besoin d'un contrôle manuel sur le flux d'exécution.

### Décorateurs de paramètres dans les middlewares

Les middlewares peuvent utiliser les mêmes décorateurs de paramètres que les contrôleurs et bénéficient également de la capture automatique d'erreurs :

```typescript
@Middleware()
export class ValidationMiddleware {
  use(
    @Body() body: any,
    @Query('validate') shouldValidate: boolean,
    @Header('content-type') contentType: string
  ) {
    if (shouldValidate && !this.isValid(body)) {
      throw new HttpError(400, 'Invalid request data');
    }
  }

  private isValid(data: any): boolean {
    // Logique de validation
    return true;
  }
}
```

**Conversion automatique de type :** Tous les décorateurs de paramètres dans les middlewares bénéficient de la même conversion automatique de type que les contrôleurs. Les paramètres sont convertis vers leurs types spécifiés avant l'exécution du middleware.

### Injection de dépendances

Comme les classes Middleware agissent comme des contrôleurs, elles permettent également l'injection de dépendances de la même manière :

```typescript
@Middleware()
export class LoggingMiddleware {
  constructor (
    private validationService: ValidationService, // Injection standard
    @Inject('CONFIG') private config: AppConfig, // Injection personnalisée pré-enregistrée
  ) {}

  use(
    @Body() body: any,
    @Inject() anotherService: AnotherService, // Même chose au niveau de la méthode
  ) {
    if (!this.validationService.isValid(body)) {
      throw new HttpError(400, 'Invalid request data');
    }
  }
}
```

## Écriture de middlewares personnalisés

Vous pouvez créer des middlewares pour des cas d'usage courants. Voici deux modèles :

### Modèle 1 : Validation simple (Pas besoin de @Next())

```typescript
@Middleware()
export class ApiKeyMiddleware implements IMiddleware {
  use(@Header('x-api-key') apiKey: string) {
    if (!apiKey || apiKey !== 'expected-key') {
      throw new HttpError(401, 'Invalid API key');
    }
    // Continuera automatiquement
  }
}
```

### Modèle 2 : Modification de réponse (Utilisant @Next())

Quand vous devez modifier la réponse, utilisez `@Next()` :

```typescript
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();

    // Ajouter les en-têtes CORS à la réponse
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}
```

## Niveaux d'utilisation des middlewares

### Niveau application

Appliqué à toutes les requêtes dans toute votre application :

```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, SecurityMiddleware]
});
```

### Niveau contrôleur

Appliqué à toutes les routes dans un contrôleur spécifique :

```typescript
// Middleware unique
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // Toutes les routes nécessitent une authentification
}

// Middlewares multiples
@Controller('/api/admin', AuthMiddleware, ValidationMiddleware)
export class AdminController {
  // Toutes les routes ont auth + validation
}
```

### Niveau endpoint

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
    // Seulement le middleware de validation
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
3. **Middlewares d'endpoint** (dans l'ordre de déclaration)
4. **Méthode de contrôleur**

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