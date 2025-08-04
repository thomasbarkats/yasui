# Contrôleurs

Les contrôleurs sont les points d'entrée de votre API. Ils définissent les points de terminaison HTTP et gèrent les requêtes entrantes en extrayant les données, en appelant la logique métier et en renvoyant les réponses.

## Vue d'ensemble

Dans YasuiJS, les contrôleurs sont des classes décorées avec `@Controller()` qui regroupent les points de terminaison associés. Chaque méthode d'un contrôleur représente un point de terminaison HTTP, défini à l'aide de décorateurs de méthode comme `@Get()`, `@Post()`, etc.

Les méthodes du contrôleur peuvent simplement renvoyer n'importe quelle valeur, qui sera automatiquement sérialisée en JSON avec un code d'état 200. Pour plus de contrôle, vous pouvez accéder directement à l'objet de réponse Express en utilisant `@Res()` et utiliser les méthodes natives Express comme `res.json()`, `res.status()`, ou `res.sendFile()`.

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // Renvoie automatiquement du JSON
  }
}
```

## Décorateur Controller

Le décorateur `@Controller()` marque une classe comme contrôleur et définit le chemin de base pour toutes ses routes.

### Utilisation de base

```typescript
@Controller('/api/users')
export class UserController {
  // Toutes les routes seront préfixées par /api/users
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

YasuiJS fournit des décorateurs pour toutes les méthodes HTTP standard. Chaque décorateur prend un paramètre de chemin (obligatoire) et des paramètres middleware optionnels.

- `@Get(path, ...middlewares)` - Gère les requêtes GET
- `@Post(path, ...middlewares)` - Gère les requêtes POST
- `@Put(path, ...middlewares)` - Gère les requêtes PUT
- `@Delete(path, ...middlewares)` - Gère les requêtes DELETE
- `@Patch(path, ...middlewares)` - Gère les requêtes PATCH

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
    // Route: GET /api/users/123
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

Appliquez un middleware à des routes spécifiques. En savoir plus dans [Middlewares](/fr/reference/middlewares).

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {}
}
```

## Décorateurs de paramètres

Extrayez des données des requêtes HTTP à l'aide de décorateurs de paramètres. YasuiJS transforme automatiquement les paramètres en fonction de leurs types TypeScript pour une meilleure sécurité des types.

### Extraire le corps de la requête

- `@Body(name?)` - Extraire les données du corps de la requête

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

### Extraire les paramètres et les en-têtes

- `@Param(name)` - Extraire les paramètres de route
- `@Query(name)` - Extraire les paramètres de requête
- `@Header(name?)` - Extraire les en-têtes de requête

Les paramètres sont automatiquement transformés en fonction de leurs types TypeScript :

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: number) { 
    // Automatiquement converti en nombre
  }

  @Get('/search')
  searchUsers(
    @Query('page') page: number,
    @Query('active') active: boolean,
    @Query('tags') tags: string[]
  ) {
    // page: number (converti de "123" à 123)
    // active: boolean (converti de "true"/"1" à true)
    // tags: string[] (de ?tags=red&tags=blue)
    return { page, active, tags };
  }

  @Get('/profile')
  getProfile(
    @Query('settings') settings: { theme: string },
    @Header('x-api-version') version: number
  ) {
    // settings: object (de ?settings={"theme":"dark"} - JSON analysé)
    // version: number (en-tête converti en nombre)
    return { settings, version };
  }
}
```

### Transformations de types prises en charge

YasuiJS convertit automatiquement les paramètres en fonction des types TypeScript :

- **string** - Pas de conversion (par défaut)
- **number** - Convertit en nombre, renvoie NaN si invalide
- **boolean** - Convertit "true"/"1" en true, tout le reste en false
- **Date** - Convertit en objet Date, renvoie Invalid Date si invalide
- **string[]** - Pour les tableaux de requête comme `?tags=red&tags=blue`
- **object** - Analyse les chaînes JSON pour les requêtes comme `?data={"key":"value"}`

### Accès à l'objet Request

- `@Req()` - Accéder à l'objet Request Express
- `@Res()` - Accéder à l'objet Response Express
- `@Next()` - Accéder à la fonction NextFunction Express

```typescript
import { Request, Response, NextFunction } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction
  ) {
    console.log(request.url);
    return { users: [] };
  }
}
```

## Gestion des réponses

YasuiJS gère automatiquement la sérialisation des réponses et les codes d'état.

### Réponses JSON automatiques

Renvoyez n'importe quelles données et elles seront automatiquement sérialisées en JSON :

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers() {
    // Renvoie automatiquement du JSON avec le statut 200
    return { users: ['John', 'Jane'] };
  }

  @Get('/string')
  getString() {
    // Renvoie une chaîne en JSON
    return 'Bonjour le monde';
  }

  @Get('/number')
  getNumber() {
    // Renvoie un nombre en JSON
    return 42;
  }
}
```

### Codes d'état personnalisés

- `@HttpStatus(code)` - Définir un code d'état HTTP personnalisé

Utilisez le décorateur `@HttpStatus()` pour définir des codes d'état personnalisés :

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/alt')
  @HttpStatus(201) // Utilisation d'un nombre
  createUserAlt(@Body() userData: any) {
    // Renvoie avec le statut 201 Created
    return { created: userData };
  }

  @Delete('/:id')
  @HttpStatus(HttpCode.NO_CONTENT) // Utilisation de l'énumération HttpCode
  deleteUser(@Param('id') id: string) {
    // Renvoie avec le statut 204 No Content
    // Peut ne rien renvoyer pour 204
  }
}
```

### Gestion manuelle des réponses

Pour un contrôle complet, utilisez l'objet de réponse Express :

```typescript
import { Response } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse(@Res() res: Response) {
    res.status(418).json({ 
      message: "Je suis une théière",
      custom: true 
    });
    // Ne rien renvoyer lors de l'utilisation directe de res
  }
}
```

## Gestion des erreurs

Laissez le framework gérer automatiquement les erreurs ou lancez des erreurs personnalisées. Pour plus de détails sur la gestion des erreurs, voir [Gestion des erreurs](/fr/reference/error-handling).