# Référence des décorateurs

Cette page documente tous les décorateurs disponibles dans YasuiJS avec leur syntaxe, paramètres et exemples d'utilisation.

## Décorateurs de classe

### @Controller(path)

Définit une classe comme contrôleur avec un préfixe de route.

**Syntaxe :**
```typescript
@Controller(path: string)
```

**Paramètres :**
- `path` (string) : Préfixe de route pour toutes les méthodes du contrôleur

**Exemple :**
```typescript
@Controller('/api/users')
export class UserController {
  @Get('/')
  getAllUsers() {
    // Route: GET /api/users/
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    // Route: GET /api/users/:id
  }
}
```

### @Injectable(options?)

Marque une classe comme injectable dans le conteneur d'injection de dépendances.

**Syntaxe :**
```typescript
@Injectable(options?: InjectableOptions)
```

**Paramètres :**
- `options` (InjectableOptions, optionnel) :
  - `scope` : 'singleton' | 'request' | 'transient' (défaut: 'singleton')

**Exemple :**
```typescript
@Injectable()
export class UserService {
  // Service singleton par défaut
}

@Injectable({ scope: 'request' })
export class RequestScopedService {
  // Nouvelle instance pour chaque requête
}
```

## Décorateurs de méthode HTTP

### @Get(path?)

Définit une route GET.

**Syntaxe :**
```typescript
@Get(path?: string)
```

**Paramètres :**
- `path` (string, optionnel) : Chemin de la route (relatif au contrôleur)

**Exemple :**
```typescript
@Get('/')
getAllUsers() {
  // GET /api/users/
}

@Get('/:id')
getUser(@Param('id') id: string) {
  // GET /api/users/:id
}
```

### @Post(path?)

Définit une route POST.

**Syntaxe :**
```typescript
@Post(path?: string)
```

**Exemple :**
```typescript
@Post('/')
createUser(@Body() userData: CreateUserDto) {
  // POST /api/users/
}
```

### @Put(path?)

Définit une route PUT.

**Syntaxe :**
```typescript
@Put(path?: string)
```

**Exemple :**
```typescript
@Put('/:id')
updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
  // PUT /api/users/:id
}
```

### @Delete(path?)

Définit une route DELETE.

**Syntaxe :**
```typescript
@Delete(path?: string)
```

**Exemple :**
```typescript
@Delete('/:id')
deleteUser(@Param('id') id: string) {
  // DELETE /api/users/:id
}
```

### @Patch(path?)

Définit une route PATCH.

**Syntaxe :**
```typescript
@Patch(path?: string)
```

**Exemple :**
```typescript
@Patch('/:id')
partialUpdateUser(@Param('id') id: string, @Body() userData: Partial<User>) {
  // PATCH /api/users/:id
}
```

## Décorateurs de paramètres

### @Param(name)

Extrait un paramètre de route.

**Syntaxe :**
```typescript
@Param(name: string)
```

**Paramètres :**
- `name` (string) : Nom du paramètre de route

**Exemple :**
```typescript
@Get('/:id')
getUser(@Param('id') id: string) {
  // Extrait l'ID de la route /users/:id
  return this.userService.getUserById(id);
}
```

### @Query(name?)

Extrait un paramètre de requête.

**Syntaxe :**
```typescript
@Query(name?: string)
```

**Paramètres :**
- `name` (string, optionnel) : Nom du paramètre de requête. Si omis, extrait tous les paramètres

**Exemple :**
```typescript
@Get('/')
getUsers(
  @Query('page') page: number = 1,
  @Query('limit') limit: number = 10,
  @Query() allParams: any
) {
  // page et limit sont extraits individuellement
  // allParams contient tous les paramètres de requête
}
```

### @Body()

Extrait le corps de la requête.

**Syntaxe :**
```typescript
@Body()
```

**Exemple :**
```typescript
@Post('/')
createUser(@Body() userData: CreateUserDto) {
  // Extrait le corps JSON de la requête POST
  return this.userService.createUser(userData);
}
```

### @Header(name)

Extrait un en-tête HTTP.

**Syntaxe :**
```typescript
@Header(name: string)
```

**Paramètres :**
- `name` (string) : Nom de l'en-tête HTTP

**Exemple :**
```typescript
@Get('/protected')
getProtectedData(@Header('authorization') token: string) {
  // Extrait l'en-tête Authorization
  return this.authService.validateToken(token);
}
```

## Décorateurs de middleware

### @Middleware(middlewares)

Applique des middlewares à une classe ou méthode.

**Syntaxe :**
```typescript
@Middleware(middlewares: MiddlewareFunction | MiddlewareFunction[])
```

**Paramètres :**
- `middlewares` : Fonction middleware ou tableau de fonctions middleware

**Exemple :**
```typescript
// Middleware au niveau contrôleur
@Controller('/api/admin')
@Middleware([authMiddleware, adminMiddleware])
export class AdminController {
  // Toutes les routes nécessitent auth + admin
}

// Middleware au niveau méthode
@Get('/sensitive')
@Middleware([rateLimitMiddleware])
getSensitiveData() {
  // Cette route a une limitation de débit
}
```

## Décorateurs Swagger

### @ApiOperation(summary, description?)

Ajoute une description d'opération pour la documentation Swagger.

**Syntaxe :**
```typescript
@ApiOperation(summary: string, description?: string)
```

**Paramètres :**
- `summary` (string) : Résumé de l'opération
- `description` (string, optionnel) : Description détaillée

**Exemple :**
```typescript
@Get('/:id')
@ApiOperation('Obtenir un utilisateur', 'Récupère les informations d\'un utilisateur par son ID')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(id);
}
```

### @ApiResponse(statusCode, description, schema?)

Définit une réponse possible pour l'opération.

**Syntaxe :**
```typescript
@ApiResponse(statusCode: number, description: string, schema?: any)
```

**Paramètres :**
- `statusCode` (number) : Code de statut HTTP
- `description` (string) : Description de la réponse
- `schema` (any, optionnel) : Schéma de la réponse

**Exemple :**
```typescript
@Get('/:id')
@ApiResponse(200, 'Succès', UserSchema)
@ApiResponse(404, 'Utilisateur non trouvé')
@ApiResponse(500, 'Erreur serveur')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(id);
}
```

### @ApiBody(schema, description?)

Définit le schéma du corps de la requête.

**Syntaxe :**
```typescript
@ApiBody(schema: any, description?: string)
```

**Paramètres :**
- `schema` (any) : Schéma du corps de la requête
- `description` (string, optionnel) : Description du corps

**Exemple :**
```typescript
@Post('/')
@ApiBody(CreateUserSchema, 'Données de l\'utilisateur à créer')
createUser(@Body() userData: CreateUserDto) {
  return this.userService.createUser(userData);
}
```

### @ApiParam(name, description?, required?, type?)

Définit un paramètre de route.

**Syntaxe :**
```typescript
@ApiParam(name: string, description?: string, required?: boolean, type?: string)
```

**Paramètres :**
- `name` (string) : Nom du paramètre
- `description` (string, optionnel) : Description du paramètre
- `required` (boolean, optionnel) : Si le paramètre est requis
- `type` (string, optionnel) : Type du paramètre

**Exemple :**
```typescript
@Get('/:id')
@ApiParam('id', 'ID de l\'utilisateur', true, 'string')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(id);
}
```

### @ApiQuery(name, description?, required?, type?)

Définit un paramètre de requête.

**Syntaxe :**
```typescript
@ApiQuery(name: string, description?: string, required?: boolean, type?: string)
```

**Paramètres :**
- `name` (string) : Nom du paramètre
- `description` (string, optionnel) : Description du paramètre
- `required` (boolean, optionnel) : Si le paramètre est requis
- `type` (string, optionnel) : Type du paramètre

**Exemple :**
```typescript
@Get('/')
@ApiQuery('page', 'Numéro de page', false, 'number')
@ApiQuery('limit', 'Nombre d\'éléments par page', false, 'number')
getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
  return this.userService.getUsers(page, limit);
}
```

## Décorateurs de statut HTTP

### @HttpStatus(code)

Définit le code de statut HTTP de la réponse.

**Syntaxe :**
```typescript
@HttpStatus(code: number)
```

**Paramètres :**
- `code` (number) : Code de statut HTTP

**Exemple :**
```typescript
@Post('/')
@HttpStatus(201)
createUser(@Body() userData: CreateUserDto) {
  // Retourne un statut 201 Created
  return this.userService.createUser(userData);
}
```

## Exemples complets

### Contrôleur complet avec tous les décorateurs

```typescript
@Controller('/api/users')
@Middleware([loggingMiddleware])
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/')
  @ApiOperation('Obtenir tous les utilisateurs', 'Récupère une liste paginée d\'utilisateurs')
  @ApiQuery('page', 'Numéro de page', false, 'number')
  @ApiQuery('limit', 'Nombre d\'éléments par page', false, 'number')
  @ApiResponse(200, 'Liste des utilisateurs', UsersListSchema)
  getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getAllUsers(page, limit);
  }

  @Get('/:id')
  @ApiOperation('Obtenir un utilisateur par ID')
  @ApiParam('id', 'ID de l\'utilisateur', true, 'string')
  @ApiResponse(200, 'Utilisateur trouvé', UserSchema)
  @ApiResponse(404, 'Utilisateur non trouvé')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('/')
  @HttpStatus(201)
  @ApiOperation('Créer un nouvel utilisateur')
  @ApiBody(CreateUserSchema, 'Données de l\'utilisateur')
  @ApiResponse(201, 'Utilisateur créé', UserSchema)
  @ApiResponse(400, 'Données invalides')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }

  @Put('/:id')
  @ApiOperation('Mettre à jour un utilisateur')
  @ApiParam('id', 'ID de l\'utilisateur', true, 'string')
  @ApiBody(UpdateUserSchema, 'Données de mise à jour')
  @ApiResponse(200, 'Utilisateur mis à jour', UserSchema)
  @ApiResponse(404, 'Utilisateur non trouvé')
  updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    return this.userService.updateUser(id, userData);
  }

  @Delete('/:id')
  @ApiOperation('Supprimer un utilisateur')
  @ApiParam('id', 'ID de l\'utilisateur', true, 'string')
  @ApiResponse(200, 'Utilisateur supprimé')
  @ApiResponse(404, 'Utilisateur non trouvé')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
```

### Service avec injection de dépendances

```typescript
@Injectable({ scope: 'singleton' })
export class UserService {
  
  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService
  ) {}

  async getAllUsers(page: number = 1, limit: number = 10) {
    return await this.databaseService.find('users', { page, limit });
  }

  async createUser(userData: CreateUserDto) {
    const user = await this.databaseService.create('users', userData);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}
```

## Bonnes pratiques

### Ordre des décorateurs

1. Décorateurs de classe (`@Controller`, `@Injectable`)
2. Décorateurs de middleware (`@Middleware`)
3. Décorateurs HTTP (`@Get`, `@Post`, etc.)
4. Décorateurs de statut (`@HttpStatus`)
5. Décorateurs Swagger (`@ApiOperation`, `@ApiResponse`, etc.)
6. Décorateurs de paramètres (`@Param`, `@Query`, `@Body`, `@Header`)

### Validation des paramètres

Utilisez TypeScript pour la validation de type et ajoutez une validation runtime si nécessaire :

```typescript
@Get('/:id')
getUser(@Param('id') id: string) {
  if (!id || id.length === 0) {
    throw new HttpError(400, 'ID requis');
  }
  return this.userService.getUserById(id);
}
```

### Documentation Swagger

Documentez toutes vos routes pour une meilleure expérience développeur :

```typescript
@Get('/')
@ApiOperation('Obtenir tous les utilisateurs')
@ApiResponse(200, 'Succès')
@ApiResponse(500, 'Erreur serveur')
getAllUsers() {
  return this.userService.getAllUsers();
}
```

### Middleware sélectif

Utilisez des middlewares spécifiques pour des routes particulières :

```typescript
@Controller('/api')
export class ApiController {
  
  @Get('/public')
  getPublicData() {
    // Pas de middleware d'authentification
  }

  @Get('/private')
  @Middleware([authMiddleware])
  getPrivateData() {
    // Nécessite une authentification
  }
}
```

Cette référence couvre tous les décorateurs disponibles dans YasuiJS. Utilisez-les pour créer des APIs expressives et bien documentées. 