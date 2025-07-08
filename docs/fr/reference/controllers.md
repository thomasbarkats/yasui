# Contrôleurs

Les contrôleurs sont les points d'entrée de votre API. Ils définissent les points de terminaison HTTP et gèrent les requêtes entrantes en extrayant des données, en appelant la logique métier et en renvoyant des réponses.

## Aperçu

Dans YasuiJS, les contrôleurs sont des classes décorées avec `@Controller()` qui regroupent des points de terminaison connexes. Chaque méthode dans un contrôleur représente un point de terminaison HTTP, défini à l'aide de décorateurs de méthode comme `@Get()`, `@Post()`, etc.

Les méthodes de contrôleur peuvent simplement renvoyer n'importe quelle valeur, qui sera automatiquement sérialisée en JSON avec un code de statut 200. Pour plus de contrôle, vous pouvez accéder directement à l'objet de réponse Express en utilisant `@Res()` et utiliser des méthodes natives d'Express comme `res.json()`, `res.status()`, ou `res.sendFile()`.

```typescript
import { Controller, Get, Post } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    return { users: [] }; // Renvoie automatiquement du JSON
  }

  @Post('/')
  createUser() {
    return { message: 'User created' }; // Renvoie automatiquement du JSON
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

Vous pouvez appliquer des middlewares à toutes les routes d'un contrôleur. En savoir plus dans [Middlewares](/fr/reference/middlewares).

```typescript
import { AuthMiddleware } from './middleware/auth.middleware';

@Controller('/api/users', AuthMiddleware)
export class UserController {
  // Toutes les routes auront AuthMiddleware appliqué
}
```

## Décorateurs de méthodes HTTP

YasuiJS fournit des décorateurs pour toutes les méthodes HTTP standard. Chaque décorateur prend un paramètre de chemin (obligatoire) et des paramètres de middleware optionnels.

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

  @Get('/:id')
  getUser() {
    return { user: {} };
  }

  @Post('/')
  createUser() {
    return { message: 'User created' };
  }

  @Put('/:id')
  updateUser() {
    return { message: 'User updated' };
  }

  @Delete('/:id')
  deleteUser() {
    return { message: 'User deleted' };
  }
}
```

### Paramètres de route

Utilisez des paramètres de route de style Express dans vos chemins :

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser() {
    // Route: GET /api/users/123
  }

  @Get('/:id/posts/:postId')
  getUserPost() {
    // Route: GET /api/users/123/posts/456
  }

  @Get('/search/:category?')
  searchUsers() {
    // Route: GET /api/users/search ou /api/users/search/admin
  }
}
```

### Middleware au niveau de la route

Appliquez des middlewares à des routes spécifiques. En savoir plus dans [Middlewares](/fr/reference/middlewares).

```typescript
import { ValidationMiddleware, AuthMiddleware } from './middleware';

@Controller('/api/users')
export class UserController {
  @Get('/', ValidationMiddleware)
  getAllUsers() {
    // Seule cette route a ValidationMiddleware
  }

  @Post('/', AuthMiddleware, ValidationMiddleware)
  createUser() {
    // Cette route a les deux middlewares
  }
}
```

## Décorateurs de paramètres

Extrayez des données des requêtes HTTP à l'aide de décorateurs de paramètres. Tous les décorateurs de paramètres peuvent être utilisés avec ou sans nom de paramètre pour extraire des valeurs spécifiques ou des objets entiers.

### Accès à l'objet Request

- `@Req()` - Accède à l'objet Request d'Express (pas de paramètres)
- `@Res()` - Accède à l'objet Response d'Express (pas de paramètres)
- `@Next()` - Accède à la fonction NextFunction d'Express (pas de paramètres)

Accédez aux objets request, response et next d'Express :

```typescript
import { Request, Response, NextFunction } from 'express';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers(
    @Req() request: Request,
    @Res() response: Response,
    @Next() next: NextFunction
  ) {
    // Accès direct aux objets Express
    console.log(request.url);
    return { users: [] };
  }
}
```

### Extraire les paramètres de route

- `@Param(name?)` - Extrait les paramètres de route (nom de paramètre optionnel)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    // Extrait un paramètre spécifique
    return { userId: id };
  }

  @Get('/:id/posts/:postId')
  getUserPost(
    @Param('id') userId: string,
    @Param('postId') postId: string
  ) {
    // Extrait plusieurs paramètres
    return { userId, postId };
  }

  @Get('/all')
  getAllWithParams(@Param() params: any) {
    // Obtient tous les paramètres de route sous forme d'objet
    return { params };
  }
}
```

### Extraire les paramètres de requête

- `@Query(name?)` - Extrait les paramètres de requête (nom de paramètre optionnel)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    // Extrait des paramètres de requête spécifiques avec valeurs par défaut
    return { page, limit };
  }

  @Get('/search')
  searchUsers(@Query() query: any) {
    // Obtient tous les paramètres de requête sous forme d'objet
    return { searchParams: query };
  }
}
```

### Extraire le corps de la requête

- `@Body(name?)` - Extrait les données du corps de la requête (nom de paramètre optionnel)

```typescript
@Controller('/api/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    // Extrait l'ensemble du corps de la requête
    return { created: userData };
  }

  @Post('/partial')
  updateUser(@Body('name') name: string) {
    // Extrait un champ spécifique du corps
    return { updatedName: name };
  }
}
```

### Extraire les en-têtes

- `@Header(name?)` - Extrait les en-têtes de requête (nom de paramètre optionnel)

```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Header('authorization') auth: string) {
    // Extrait un en-tête spécifique
    return { authHeader: auth };
  }

  @Get('/all-headers')
  getUsersWithHeaders(@Header() headers: any) {
    // Obtient tous les en-têtes sous forme d'objet
    return { headers };
  }
}
```

## Gestion des réponses

YasuiJS gère automatiquement la sérialisation des réponses et les codes de statut.

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
    // Renvoie une chaîne sous forme de JSON
    return 'Hello World';
  }

  @Get('/number')
  getNumber() {
    // Renvoie un nombre sous forme de JSON
    return 42;
  }
}
```

### Codes de statut personnalisés

- `@HttpStatus(code)` - Définit un code de statut HTTP personnalisé (paramètre de code de statut requis, accepte un nombre ou l'énumération HttpCode)

Utilisez le décorateur `@HttpStatus()` pour définir des codes de statut personnalisés :

```typescript
import { HttpStatus, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Post('/')
  @HttpStatus(201) // Utilisation d'un nombre
  createUser(@Body() userData: any) {
    // Renvoie avec le statut 201 Created
    return { created: userData };
  }

  @Post('/alt')
  @HttpStatus(HttpCode.CREATED) // Utilisation de l'énumération HttpCode
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

Pour un contrôle complet, utilisez l'objet response d'Express :

```typescript
import { Response } from 'express';

@Controller('/api/users')
export class UserController {
  @Get('/custom')
  customResponse(@Res() res: Response) {
    res.status(418).json({ 
      message: "I'm a teapot",
      custom: true 
    });
    // Ne renvoyez rien lorsque vous utilisez res directement
  }

  @Get('/file')
  downloadFile(@Res() res: Response) {
    res.download('/path/to/file.pdf');
  }
}
```

## Gestion des erreurs

Laissez le framework gérer automatiquement les erreurs ou lancez des erreurs personnalisées. Pour des détails complets sur la gestion des erreurs, voir [Gestion des erreurs](/fr/reference/error-handling).

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.findById(id);
    
    if (!user) {
      // Lance une erreur HTTP personnalisée
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    
    return user;
  }
}
```