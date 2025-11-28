# Contrôleurs

Les contrôleurs sont les points d'entrée de votre API. Ils définissent les endpoints HTTP et gèrent les requêtes entrantes en extrayant les données, appelant la logique métier et retournant les réponses.

## Vue d'ensemble

Dans YasuiJS, les contrôleurs sont des classes décorées avec `@Controller()` qui regroupent les endpoints liés ensemble. Chaque méthode dans un contrôleur représente un endpoint HTTP, défini en utilisant des décorateurs de méthode comme `@Get()`, `@Post()`, etc.

Les méthodes de contrôleur peuvent simplement retourner n'importe quelle valeur, qui sera automatiquement sérialisée en JSON avec un code de statut 200. Pour un contrôle manuel de la réponse, vous pouvez retourner directement un objet Response des Web Standards.

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // Retourne automatiquement du JSON
  }
}
```

## Décorateur Controller

Le décorateur `@Controller()` marque une classe comme contrôleur et définit le chemin de base pour toutes ses routes.

### Utilisation de base

```typescript
@Controller('/api/users')
export class UserController {
  // Toutes les routes seront préfixées avec /api/users
}
```

### Avec Middleware

Vous pouvez appliquer un middleware à toutes les routes d'un contrôleur. En savoir plus dans [Middlewares](/fr/reference/middlewares).

```typescript
@Controller('/api/users', AuthMiddleware)
export class UserController {
  // Toutes les routes auront AuthMiddleware appliqué
}
```

## Décorateurs de méthodes HTTP

YasuiJS fournit des décorateurs pour toutes les méthodes HTTP standard. Chaque décorateur prend un paramètre de chemin (requis) et des paramètres de middleware optionnels.

- `@Get(path, ...middlewares)` - Gérer les requêtes GET
- `@Post(path, ...middlewares)` - Gérer les requêtes POST
- `@Put(path, ...middlewares)` - Gérer les requêtes PUT
- `@Delete(path, ...middlewares)` - Gérer les requêtes DELETE
- `@Patch(path, ...middlewares)` - Gérer les requêtes PATCH

### Routes de base

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] };
  }

  @Post('/')
  createUser() {
    return { message: 'Utilisateur créé' };
  }

  @Get('/:id')
  getUser() {
    // Utilisez les paramètres de route de style Express dans vos chemins :
    // Route : GET /api/users/123
    return { user: {} };
  }

  @Put('/:id')
  updateUser() {
    return { message: 'Utilisateur mis à jour' };
  }

  @Delete('/:id')
  deleteUser() {
    return { message: 'Utilisateur supprimé' };
  }
}
```

### Middleware au niveau des routes

Appliquer un middleware à des routes spécifiques. En savoir plus dans [Middlewares](/fr/reference/middlewares).

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {}
}
```

## Décorateurs de paramètres

Extraire des données des requêtes HTTP en utilisant des décorateurs de paramètres. YasuiJS transforme automatiquement les paramètres basés sur leurs types TypeScript pour une meilleure sécurité de type.

### Extraire le corps de la requête

`@Body(name?)` - Extraire les données du corps de la requête

```typescript
@Controller('/api/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    // Extraire tout le corps de la requête
    return { created: userData };
  }

  @Post('/partial')
  updateUser(@Body('name') name: string) {
    // Extraire un champ spécifique du corps
    return { updatedName: name };
  }
}
```

### Extraire les paramètres et en-têtes

- `@Param(name, items?)` - Extraire les paramètres de route
- `@Query(name, items?)` - Extraire les paramètres de requête
- `@Header(name, items?)` - Extraire les en-têtes de requête

Les paramètres sont automatiquement transformés basés sur leurs types TypeScript. Pour les tableaux avec des types non-string, vous devez spécifier le type d'élément comme second paramètre :

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: number) {} // Converti en nombre.

  @Get('/search/:term')
  searchUsers(
    @Param('term') term: string,
    @Header('x-api-version') version: number,
    @Query('filters', [Boolean]) filters: boolean[],
    @Query('settings') settings: { theme: string } | null,
  ) {
    // version: number (en-tête converti en nombre)
    // filters: boolean[] (de ?filters=true&filters=false&filters=1)
    // settings: object (de ?settings={"theme":"dark"} - JSON parsé, null si échec)
    return { page, active, tags, priorities };
  }
}
```

## Conversion automatique des types de paramètres

YasuiJS convertit automatiquement les paramètres basés sur les types TypeScript :

### Types de base
- **string** - Aucune conversion (par défaut)
- **boolean** - Convertit "true"/"1" en true, tout le reste en false
- **number** - Convertit en nombre, retourne `NaN` si invalide (ou lance avec `strictValidation`)
- **Date** - Convertit en objet Date, retourne `Invalid Date` si invalide (ou lance ``)
- **object** - Parse les chaînes JSON pour les requêtes comme `?data={"key":"value"}`, retourne `null` si échec (ou lance ``)

### Types de tableaux
TypeScript ne peut pas détecter les types d'éléments de tableau à l'exécution, donc vous devez spécifier `[Type]` pour les tableaux non-string :

- **string[]** - Aucune configuration supplémentaire nécessaire (comportement par défaut)
- **tableaux number, boolean, ou Date** - Doit spécifier le type d'élément en utilisant le second paramètre

**Syntaxe de tableau typé :**
```typescript
@Query('paramName', [Type]) paramName: Type[]
@Param('paramName', [Type]) paramName: Type[]
@Header('headerName', [Type]) headerName: Type[]
```

### Mode de validation stricte

Par défaut, YasuiJS retourne des valeurs invalides (NaN, Invalid Date, null) lors de l'échec de conversion de type. Activez `strictValidation` dans votre configuration pour lancer une erreur HTTP 400 à la place :

```typescript
yasui.createServer({
  controllers: [UserController],
  strictValidation: true  // Lance des erreurs lors d'échecs de conversion de types
});
```

**Comportement par défaut (strictValidation: false) :**
```typescript
@Get('/:id')
getUser(@Param('id') id: number) {
  // GET /user/abc → id = NaN (échec silencieux)
  // GET /user/123 → id = 123
}

@Get('/search')
search(@Query('date') date: Date) {
  // GET /search?date=invalid → date = Invalid Date
  // GET /search?date=2024-01-01 → date = objet Date
}
```

**Validation stricte (strictValidation: true) :**
```typescript
@Get('/:id')
getUser(@Param('id') id: number) {
  // GET /user/abc → lance HttpError(400, "Parameter 'id' expected number, got 'abc'")
  // GET /user/123 → id = 123
}

@Get('/search')
search(
  @Query('date') date: Date,
  @Query('ids', [Number]) ids: number[]
) {
  // GET /search?date=invalid
  //   → lance HttpError(400, "Parameter 'date' expected valid date, got 'invalid'")

  // GET /search?ids=1&ids=2&ids=abc
  //   → lance HttpError(400, "Parameter 'ids[2]' expected number, got 'abc'")
}
```

**Analyse du body JSON :**
```typescript
@Post('/')
createUser(@Body() data: any) {
  // Avec strictValidation: false
  //   JSON invalide → data = undefined (échec silencieux)

  // Avec strictValidation: true
  //   JSON invalide → lance HttpError(400, "Failed to parse JSON body: ...")
}
```

Voir [Configuration](/reference/config#strictvalidation) pour plus de détails.

## Accès à l'objet Request

`@Req()` - Accéder à l'objet Request YasuiJS (Web Standards Request avec propriétés compatibles Express)

```typescript
import { Request } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(@Req() request: Request) {
    console.log(request.url);
    return { users: [] };
  }
}
```

**Propriétés de requête disponibles :**
- `url` - URL complète de la requête
- `method` - Méthode HTTP (GET, POST, etc.)
- `headers` / `rawHeaders` - En-têtes de requête (voir [Accès aux En-têtes](#accès-aux-en-têtes))
- `params` - Paramètres de route
- `query` - Paramètres de chaîne de requête
- `cookies` - Cookies analysés
- `body` - Corps de requête analysé
- `path` - Nom de chemin de la requête
- `hostname` - Nom d'hôte de la requête
- `protocol` - Protocole de la requête (http/https)
- `ip` - Adresse IP du client

### Accès aux En-têtes

YasuiJS fournit deux façons d'accéder aux en-têtes :

**Style Express (objet simple)**

Pour la compatibilité afin d'éviter un changement incompatible depuis la v3.
```typescript
@Get('/')
getUsers(@Req() req: Request) {
  const auth = req.headers.authorization;        // Notation par point
  const type = req.headers['content-type'];      // Notation par crochets
}
```

**Standards Web Natifs (objet Headers) :**
```typescript
@Get('/')
getUsers(@Req() req: Request) {
  const auth = req.rawHeaders.get('authorization');
  const type = req.rawHeaders.get('content-type');
}
```

**Quand utiliser :**
- `req.headers` - Lorsque vous accédez à plusieurs en-têtes ou préférez la syntaxe style Express
- `req.rawHeaders` - Meilleur pour les vérifications d'en-tête unique, meilleures performances (pas de conversion d'objet)

### Création de Décorateurs de Requête Personnalisés

Vous pouvez créer vos propres décorateurs pour extraire des propriétés spécifiques de l'objet de requête en utilisant `routeRequestParamDecorator`.

```typescript
import { routeRequestParamDecorator } from 'yasui';

// Créer un décorateur personnalisé pour l'IP de la requête
export const Ip = routeRequestParamDecorator('ip');

// Utiliser dans le contrôleur
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Ip() ip: string) {
    console.log(`Requête depuis ${ip}`);
    return { users: [] };
  }
}
```

Cette approche est préférée à l'utilisation de `@Req()` pour l'accès à une seule propriété, car elle :
- Améliore la lisibilité du code
- Active la sécurité de type

Voir [Accès à l'objet Request](#accès-à-lobjet-request) pour la liste complète des propriétés de requête disponibles.

## Gestion des réponses

YasuiJS gère automatiquement la sérialisation des réponses et les codes de statut.

### Réponses JSON automatiques

Retournez n'importe quelle donnée et elle sera automatiquement sérialisée en JSON :

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // Retourne automatiquement du JSON avec le statut 200
    return { users: ['John', 'Jane'] };
  }

  @Get('/string')
  getString() {
    // Retourne la chaîne comme JSON
    return 'Hello World';
  }

  @Get('/number')
  getNumber() {
    // Retourne le nombre comme JSON
    return 42;
  }
}
```

### Codes de statut personnalisés

`@HttpStatus(code)` - Définir un code de statut HTTP personnalisé

Utilisez le décorateur `@HttpStatus()` pour définir des codes de statut personnalisés :

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/alt')
  @HttpStatus(201) // Utilisant un nombre
  createUserAlt(@Body() userData: any) {
    // Retourne avec le statut 201 Created
    return { created: userData };
  }

  @Delete('/:id')
  @HttpStatus(HttpCode.NO_CONTENT) // Utilisant l'énumération HttpCode
  deleteUser(@Param('id') id: string) {
    // Retourne avec le statut 204 No Content
    // Peut ne rien retourner pour 204
  }
}
```

### Gestion manuelle des réponses

Pour un contrôle complet, retournez un objet Response des Web Standards :

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse() {
    return new Response(JSON.stringify({
      message: "Je suis une théière",
      custom: true
    }), {
      status: 418,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  @Get('/text')
  textResponse() {
    return new Response('Réponse en texte brut', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
```

## Gestion des erreurs

Laissez le framework gérer les erreurs automatiquement ou lancez des erreurs personnalisées. Pour les détails complets de gestion des erreurs, voir [Gestion des erreurs](/fr/reference/error-handling).