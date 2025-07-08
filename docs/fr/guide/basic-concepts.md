# Concepts de Base

Ce guide présente les concepts fondamentaux qui font fonctionner YasuiJS. Comprendre ces concepts vous aidera à construire de meilleures API et à tirer le meilleur parti de l'architecture du framework.

## Aperçu

YasuiJS est construit autour de quelques concepts clés :

- **Contrôleurs** : Définissent vos points d'entrée d'API et gèrent les requêtes HTTP
- **Services** : Contiennent votre logique métier et les opérations de données
- **Injection de Dépendances** : Gère automatiquement les relations entre les composants
- **Décorateurs** : Fournissent des métadonnées et de la configuration de manière déclarative
- **Middleware** : Traite les requêtes dans un pipeline avant d'atteindre les contrôleurs

## Contrôleurs

**Les contrôleurs sont les points d'entrée de votre API.** Ils définissent quels points d'entrée existent et comment répondre aux requêtes HTTP.

### Ce que font les Contrôleurs

Les contrôleurs ont une responsabilité principale : traduire les requêtes HTTP en opérations métier et renvoyer des réponses appropriées. Ils devraient être des couches minces qui délèguent le travail réel aux services.

```typescript
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Pourquoi les Contrôleurs sont Importants

- **Organisation des Routes** : Regrouper logiquement les points d'entrée connexes
- **Gestion des Requêtes** : Extraire et valider automatiquement les données de requête
- **Formatage des Réponses** : Renvoyer des données qui sont automatiquement sérialisées
- **Séparation des Préoccupations** : Garder la logique HTTP séparée de la logique métier

Les contrôleurs doivent se concentrer sur les préoccupations HTTP (routage, codes d'état, en-têtes) tout en déléguant la logique métier aux services.

## Services

**Les services contiennent votre logique métier.** Ils effectuent le travail réel dont votre application a besoin, indépendamment de la façon dont ce travail a été demandé.

### Ce que font les Services

Les services encapsulent les opérations métier et peuvent être utilisés par plusieurs contrôleurs. Ils gèrent des choses comme le traitement des données, les appels API externes et les règles métier.

```typescript
@Injectable()
export class UserService {
  private users = [];

  getAllUsers() {
    return this.users;
  }

  createUser(userData) {
    // Logique métier ici
    const user = { id: generateId(), ...userData };
    this.users.push(user);
    return user;
  }
}
```

### Pourquoi les Services sont Importants

- **Réutilisabilité** : Plusieurs contrôleurs peuvent utiliser le même service
- **Testabilité** : La logique métier peut être testée indépendamment du HTTP
- **Organisation** : Les opérations métier connexes sont regroupées
- **Maintenabilité** : Les changements dans la logique métier n'affectent pas les contrôleurs

Les services doivent se concentrer sur "ce que" fait votre application, pas "comment" on y accède.

## Injection de Dépendances

**L'Injection de Dépendances gère automatiquement les relations entre les composants.** Au lieu de créer et de connecter manuellement des objets, YasuiJS le fait pour vous.

### Comment Ça Fonctionne

Quand YasuiJS voit un contrôleur qui a besoin d'un service, il crée automatiquement le service et l'injecte :

```typescript
@Injectable()
export class UserService {
  // Implémentation du service
}

@Controller('/users')
export class UserController {
  // UserService est automatiquement créé et injecté
  constructor(private userService: UserService) {}
}
```

### Pourquoi l'Injection de Dépendances est Importante

- **Couplage Faible** : Les composants ne créent pas leurs propres dépendances
- **Testabilité** : Facile de remplacer les dépendances par des mocks pour les tests
- **Flexibilité** : Changer les implémentations sans modifier les consommateurs
- **Gestion du Cycle de Vie** : Le framework gère la création et le nettoyage des objets

Vous déclarez ce dont vous avez besoin, et le framework détermine comment le fournir.

## Décorateurs

**Les décorateurs fournissent des métadonnées sur votre code.** Ils indiquent à YasuiJS comment interpréter et configurer vos classes et méthodes.

### Ce que font les Décorateurs

Les décorateurs remplacent les fichiers de configuration et la configuration manuelle par des annotations déclaratives :

```typescript
@Controller('/api/users')    // Cette classe gère les routes /api/users
export class UserController {
  
  @Get('/:id')              // Cette méthode gère les requêtes GET
  getUser(@Param('id') id: string) {  // Extrait 'id' de l'URL
    return { id, name: 'John' };
  }
}
```

### Types de Décorateurs

- **Décorateurs de Classe** : `@Controller()`, `@Injectable()`, `@Middleware()` - définissent ce que représente une classe
- **Décorateurs de Méthode** : `@Get()`, `@Post()`, `@Put()` - définissent les méthodes HTTP et les routes
- **Décorateurs de Paramètre** : `@Param()`, `@Body()`, `@Query()` - extraient les données de requête

### Pourquoi les Décorateurs sont Importants

- **Déclaratif** : Le code indique clairement son intention
- **Co-localisation** : La configuration vit à côté du code qu'elle configure
- **Sécurité de Type** : TypeScript peut valider l'utilisation des décorateurs
- **Traitement Automatique** : Le framework lit les décorateurs et configure tout

Les décorateurs rendent votre code auto-documenté et éliminent le câblage manuel.

## Middleware

**Le middleware traite les requêtes dans un pipeline.** Chaque middleware peut examiner, modifier ou arrêter une requête avant qu'elle n'atteigne votre contrôleur.

### Comment Fonctionne le Middleware

Les fonctions middleware s'exécutent en séquence, chacune décidant de continuer vers l'étape suivante ou non :

```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    // Vérifier l'authentification
    if (req.headers.authorization) {
      next(); // Continuer vers le prochain middleware ou contrôleur
    } else {
      throw new Error('Unauthorized'); // Arrêter ici
    }
  }
}
```

### Niveaux de Middleware

Le middleware peut être appliqué à différents niveaux :

```typescript
// Global : s'applique à toutes les requêtes
yasui.createServer({
  middlewares: [LoggingMiddleware]
});

// Contrôleur : s'applique à toutes les routes du contrôleur
@Controller('/users', AuthMiddleware)
export class UserController {}

// Route : s'applique à un point d'entrée spécifique
@Get('/', ValidationMiddleware)
getUsers() {}
```

### Pourquoi le Middleware est Important

- **Préoccupations Transversales** : Gérer l'authentification, la journalisation, la validation globalement
- **Réutilisabilité** : Le même middleware peut être utilisé sur différentes routes
- **Composabilité** : Combiner plusieurs middlewares pour un comportement complexe
- **Séparation** : Garder des préoccupations comme l'authentification séparées de la logique métier

Le middleware vous permet de construire des pipelines de traitement de requêtes à la fois puissants et maintenables.

## Comment Tout Fonctionne Ensemble

Ces concepts se combinent pour créer une architecture propre :

```typescript
// 1. Le middleware traite la requête
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Next() next: NextFunction) {
    // Authentifier la requête
    next();
  }
}

// 2. Le service contient la logique métier
@Injectable()
export class UserService {
  createUser(userData) {
    // Logique métier ici
    return newUser;
  }
}

// 3. Le contrôleur coordonne les couches HTTP et métier
@Controller('/users', AuthMiddleware)
export class UserController {
  constructor(private userService: UserService) {} // DI

  @Post('/') // Le décorateur définit la route
  createUser(@Body() userData: any) { // Le décorateur extrait les données
    return this.userService.createUser(userData); // Déléguer au service
  }
}
```

### Le Flux de Requête

1. **La requête arrive** à votre API
2. **Le middleware** la traite (auth, journalisation, etc.)
3. **Le contrôleur** reçoit la requête via les décorateurs
4. **L'injection de dépendances** fournit les services requis
5. **Le service** effectue l'opération métier
6. **Le contrôleur** renvoie le résultat
7. **Le framework** sérialise et envoie la réponse

## Avantages de Cette Architecture

### Séparation des Préoccupations
Chaque composant a une responsabilité claire et unique :
- Les contrôleurs gèrent HTTP
- Les services gèrent la logique métier
- Le middleware gère les préoccupations transversales

### Testabilité
Les composants peuvent être testés isolément :
- Tester les services sans HTTP
- Tester les contrôleurs avec des services simulés
- Tester le middleware indépendamment

### Maintenabilité
Les changements sont localisés :
- Les changements de logique métier n'affectent pas les contrôleurs
- Les changements de route n'affectent pas les services
- Les nouvelles fonctionnalités peuvent réutiliser les services existants

### Évolutivité
L'architecture supporte la croissance :
- Ajouter facilement de nouveaux contrôleurs
- Partager des services entre contrôleurs
- Composer des middlewares pour des exigences complexes

## Quand Utiliser Quoi

### Utilisez les Contrôleurs Pour :
- Définir les points d'entrée API
- Extraire les données de requête
- Définir les codes d'état de réponse
- Coordonner entre les services

### Utilisez les Services Pour :
- La logique et les règles métier
- Le traitement des données
- Les appels API externes
- Les opérations qui pourraient être réutilisées

### Utilisez l'Injection de Dépendances Pour :
- Connecter les services aux contrôleurs
- Gérer les cycles de vie des objets
- Faciliter les tests
- Garder le code faiblement couplé

### Utilisez les Décorateurs Pour :
- Définir les routes et méthodes HTTP
- Extraire les paramètres de requête
- Configurer le middleware
- Ajouter des métadonnées pour la documentation

### Utilisez le Middleware Pour :
- L'authentification et l'autorisation
- La journalisation des requêtes/réponses
- La validation des entrées
- La limitation de débit
- La gestion des erreurs