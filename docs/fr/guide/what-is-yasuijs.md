# Qu'est-ce que YasuiJS ?

YasuiJS est un framework REST API moderne et léger conçu spécifiquement pour les développeurs TypeScript. Il prend la simplicité d'Express.js et l'améliore avec de puissants décorateurs et l'injection de dépendances, rendant le développement d'API plus intuitif et maintenable.

## Pourquoi YasuiJS ?

Construire des APIs REST peut être répétitif et sujet aux erreurs. Les applications Express.js traditionnelles nécessitent beaucoup de code boilerplate pour l'enregistrement des routes, l'extraction des paramètres et la gestion des dépendances. YasuiJS élimine cette complexité en fournissant une approche déclarative du développement d'API.

### Le problème avec les approches traditionnelles

Lors de la construction d'APIs avec Express.js pur, vous vous retrouvez souvent avec du code comme ceci :

```typescript
// Approche Express.js traditionnelle
app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const users = userService.getUsers(page, limit);
  res.json(users);
});

app.post('/api/users', (req, res) => {
  const userData = req.body;
  const newUser = userService.createUser(userData);
  res.status(201).json(newUser);
});
```

Cette approche présente plusieurs problèmes :
- Extraction et validation manuelles des paramètres
- Gestion d'erreurs répétitive
- Difficile à tester en raison du couplage serré
- Aucune génération automatique de documentation

### La solution YasuiJS

Avec YasuiJS, la même fonctionnalité devient beaucoup plus propre :

```typescript
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers(@Query('page') page: number = 1, @Query('limit') limit: number = 10) {
    return this.userService.getUsers(page, limit);
  }

  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
}
```

## Philosophie de base

YasuiJS est construit autour de ces principes fondamentaux :

### Déclaratif plutôt qu'impératif
Au lieu d'enregistrer manuellement les routes et d'extraire les paramètres, vous déclarez ce que vous voulez en utilisant des décorateurs. Le framework s'occupe du reste.

### TypeScript en premier
Chaque fonctionnalité est conçue avec TypeScript à l'esprit, fournissant une sécurité de type complète et un excellent support IDE.

### Configuration zéro
Commencez immédiatement avec des valeurs par défaut sensées. La configuration avancée est disponible quand vous en avez besoin.

### Fondation Express.js
Construit sur Express.js, vous pouvez donc utiliser n'importe quel middleware ou plugin Express.js dans votre application YasuiJS.

## Fonctionnalités clés

### Routage basé sur les décorateurs

Définissez vos endpoints API en utilisant des décorateurs intuitifs qui expriment clairement votre intention :

```typescript
@Controller('/api/users')
export class UserController {
  
  @Get('/')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('/')
  createUser(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }

  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() user: UpdateUserDto) {
    return this.userService.updateUser(id, user);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
```

### Injection de dépendances

Injectez automatiquement des services et des dépendances dans vos contrôleurs :

```typescript
@Injectable()
export class UserService {
  async getUsers() {
    // Logique de base de données ici
    return await this.database.find('users');
  }
}

@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  async getUsers() {
    return await this.userService.getUsers();
  }
}
```

Le framework crée automatiquement des instances de vos services et les injecte là où c'est nécessaire. Cela rend votre code plus testable et maintenable.

### Documentation automatique

Générez une belle documentation d'API sans écrire une seule ligne de code de documentation :

```typescript
@Get('/:id')
@ApiOperation('Obtenir un utilisateur par ID', 'Récupère les informations détaillées d\'un utilisateur par son identifiant unique')
@ApiResponse(200, 'Succès', UserSchema)
@ApiResponse(404, 'Utilisateur non trouvé')
getUser(@Param('id') id: string) {
  return this.userService.getUserById(id);
}
```

### Middleware flexible

Appliquez des middlewares à différents niveaux avec facilité :

```typescript
@Controller('/admin')
@Middleware([authMiddleware, adminMiddleware])
export class AdminController {
  
  @Get('/users')
  @Middleware([rateLimitMiddleware])
  getUsers() {
    // Cette route nécessite une authentification, des privilèges admin et une limitation de débit
  }
}
```

### Extraction de paramètres

Extrayez et validez automatiquement les données de requête :

```typescript
@Post('/search')
searchUsers(
  @Query('page') page: number,
  @Query('limit') limit: number,
  @Body() filters: SearchFilters,
  @Header('authorization') token: string
) {
  // Tous les paramètres sont automatiquement extraits, typés et validés
  return this.userService.searchUsers(page, limit, filters, token);
}
```

## Vue d'ensemble de l'architecture

YasuiJS s'appuie sur Express.js, fournissant une abstraction de niveau supérieur :

```
┌─────────────────┐
│   YasuiJS App   │  ← Votre code d'application
├─────────────────┤
│   Contrôleurs   │  ← Gestionnaires de routes avec décorateurs
│   Services      │  ← Logique métier avec DI
│   Middleware    │  ← Traitement des requêtes
├─────────────────┤
│   Express.js    │  ← Serveur HTTP et routage
├─────────────────┤
│   Serveur HTTP  │  ← Couche réseau
└─────────────────┘
```

### Comment ça fonctionne

1. **Démarrage de l'application** : YasuiJS scanne vos contrôleurs et services
2. **Enregistrement des routes** : Enregistre automatiquement les routes basées sur les décorateurs
3. **Résolution des dépendances** : Crée et injecte les instances de services
4. **Traitement des requêtes** : Gère les requêtes entrantes à travers la chaîne de middleware
5. **Génération des réponses** : Sérialise et envoie automatiquement les réponses

## Quand utiliser YasuiJS

YasuiJS est parfait pour :

- **APIs REST** : Construire des endpoints REST propres et bien documentés
- **Microservices** : Services légers avec surcharge minimale
- **Projets TypeScript** : Sécurité de type complète et fonctionnalités ES6+ modernes
- **Migration Express.js** : Migration progressive depuis des applications Express.js existantes
- **Prototypage rapide** : Faire fonctionner des APIs rapidement avec une configuration minimale

## Commencer

Prêt à construire votre première API YasuiJS ? Le [guide de démarrage](/fr/getting-started) vous guidera à travers la création d'une API complète en quelques minutes.

```bash
npm install yasui
```

YasuiJS est conçu pour rendre le développement d'API agréable et efficace. Que vous construisiez une API REST simple ou un microservice complexe, YasuiJS fournit les outils dont vous avez besoin pour écrire du code propre et maintenable. 