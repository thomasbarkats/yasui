# Middlewares

Les middlewares traitent les requêtes dans un pipeline avant qu'elles n'atteignent vos contrôleurs. Ils gèrent les préoccupations transversales comme l'authentification, la journalisation, la validation et la transformation des requêtes.

## Vue d'ensemble

YasuiJS supporte deux types de middlewares, tous deux construits sur les standards Web et compatibles avec tous les runtimes (Node.js, Deno, Bun) :

1. **Middlewares basés sur des classes** - Utilisent le décorateur `@Middleware()` avec support de l'injection de dépendances
2. **Middlewares fonctionnels** - Fonctions simples suivant le pattern `Request → Response` des standards Web

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

## Middlewares fonctionnels

Les middlewares fonctionnels sont de simples fonctions qui suivent le pattern `Request → Response` des standards Web. Ils sont parfaits pour les intégrations tierces, les opérations sans état ou lorsque vous n'avez pas besoin d'injection de dépendances.

```typescript
import type { YasuiRequest, RequestHandler, NextFunction } from 'yasui';

export function simpleLogger(): RequestHandler {
  return async (req: YasuiRequest, next?: NextFunction): Promise<Response> => {
    console.log(`${req.method} ${req.path}`);
    return next ? next() : new Response(null, { status: 500 });
  };
}

// Utilisation
yasui.createServer({
  middlewares: [simpleLogger()],
  controllers: [UserController]
});
```

**Compatibilité tierce :** Les middlewares fonctionnels fonctionnent avec toute bibliothèque fournissant des handlers compatibles avec les standards Web, comme les bibliothèques d'authentification (ex. `auth.handler()` de BetterAuth), les plugins officiels, ou les handlers fetch personnalisés.

**Quand les utiliser :**
- Intégrations tierces (BetterAuth, etc.)
- Opérations sans état (logging, CORS, limitation de débit)
- Pas besoin d'injection de dépendances

**Quand utiliser des classes :**
- Besoin d'injection de dépendances (`@Inject()`)
- Accès aux services/base de données
- Logique métier complexe avec état partagé

## Middlewares basés sur des classes

### Décorateur Middleware

Le décorateur `@Middleware()` marque une classe comme middleware. La classe doit implémenter une méthode `use()`. Vous pouvez optionnellement implémenter l'interface `IMiddleware` fournie par YasuiJS pour imposer la signature de méthode.

```typescript
import { Middleware, IMiddleware, Request, Req } from 'yasui';

@Middleware()
export class AuthMiddleware implements IMiddleware {
  use(@Req() req: Request) {
    const token = req.rawHeaders.get('authorization');

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
export class TimingMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const start = Date.now();
    const response = await next();
    const duration = Date.now() - start;

    const headers = new Headers(response.headers);
    headers.set('X-Response-Time', `${duration}ms`);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    });
  }
}
```

**Pour la gestion CORS en production**, utilisez le plugin officiel [`@yasui/cors`](/fr/plugins/cors) qui fournit la validation des origines, la gestion des requêtes preflight, le support des credentials et des fonctionnalités de sécurité modernes.

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