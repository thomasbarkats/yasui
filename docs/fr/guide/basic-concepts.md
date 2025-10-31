# Concepts de base

Ce guide présente les concepts fondamentaux qui font fonctionner YasuiJS. Comprendre ces concepts vous aidera à construire de meilleures API et à tirer le meilleur parti de l'architecture du framework.

## Vue d'ensemble

YasuiJS est construit autour de quelques concepts centraux :

- **Contrôleurs** : Définissent vos endpoints d'API et gèrent les requêtes HTTP
- **Services** : Contiennent votre logique métier et les opérations de données
- **Injection de dépendances** : Gèrent automatiquement les relations entre composants
- **Décorateurs** : Fournissent des métadonnées et une configuration de manière déclarative
- **Middleware** : Traitent les requêtes dans un pipeline avant d'atteindre les contrôleurs

## Contrôleurs

**Les contrôleurs sont les points d'entrée de votre API.** Ils définissent quels endpoints existent et comment répondre aux requêtes HTTP.

### Ce que font les contrôleurs

Les contrôleurs ont une responsabilité principale : traduire les requêtes HTTP en opérations métier et retourner des réponses appropriées. Ils doivent être des couches minces qui délèguent le travail réel aux services.

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

### Pourquoi les contrôleurs sont importants

- **Organisation des routes** : Grouper logiquement les endpoints liés
- **Gestion des requêtes** : Extraire et valider automatiquement les données de requête
- **Formatage des réponses** : Retourner des données qui sont automatiquement sérialisées
- **Séparation des préoccupations** : Garder la logique HTTP séparée de la logique métier

Les contrôleurs doivent se concentrer sur les préoccupations HTTP (routage, codes de statut, en-têtes) tout en déléguant la logique métier aux services.

## Services

**Les services contiennent votre logique métier.** Ils effectuent le travail réel que votre application doit faire, indépendamment de la façon dont ce travail a été demandé.

### Ce que font les services

Les services encapsulent les opérations métier et peuvent être utilisés par plusieurs contrôleurs. Ils gèrent des choses comme le traitement des données, les appels d'API externes et les règles métier.

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

### Pourquoi les services sont importants

- **Réutilisabilité** : Plusieurs contrôleurs peuvent utiliser le même service
- **Testabilité** : La logique métier peut être testée indépendamment de HTTP
- **Organisation** : Les opérations métier liées sont groupées ensemble
- **Maintenabilité** : Les changements de logique métier n'affectent pas les contrôleurs

Les services doivent se concentrer sur "ce que" fait votre application, pas "comment" on y accède.

## Injection de dépendances

**L'injection de dépendances gère automatiquement les relations entre composants.** Au lieu de créer et connecter manuellement les objets, YasuiJS le fait pour vous.

### Comment ça fonctionne

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

### Pourquoi l'injection de dépendances est importante

- **Couplage faible** : Les composants ne créent pas leurs propres dépendances
- **Testabilité** : Facile de remplacer les dépendances par des mocks pour les tests
- **Flexibilité** : Changer les implémentations sans modifier les consommateurs
- **Gestion du cycle de vie** : Le framework gère la création et le nettoyage des objets

Vous déclarez ce dont vous avez besoin, et le framework détermine comment le fournir.

## Décorateurs

**Les décorateurs fournissent des métadonnées sur votre code.** Ils disent à YasuiJS comment interpréter et configurer vos classes et méthodes.

### Ce que font les décorateurs

Les décorateurs remplacent les fichiers de configuration et la configuration manuelle par des annotations déclaratives :

```typescript
@Controller('/api/users')    // Cette classe gère les routes /api/users
export class UserController {
  
  @Get('/:id')              // Cette méthode gère les requêtes GET
  getUser(@Param('id') id: string) {  // Extraire 'id' de l'URL
    return { id, name: 'John' };
  }
}
```

### Types de décorateurs

- **Décorateurs de classe** : `@Controller()`, `@Injectable()`, `@Middleware()` - définissent ce qu'une classe représente
- **Décorateurs de méthode** : `@Get()`, `@Post()`, `@Put()` - définissent les méthodes HTTP et les routes
- **Décorateurs de paramètre** : `@Param()`, `@Body()`, `@Query()` - extraient les données de requête

### Pourquoi les décorateurs sont importants

- **Déclaratif** : Le code exprime clairement son intention
- **Co-localisation** : La configuration vit à côté du code qu'elle configure
- **Sécurité de type** : TypeScript peut valider l'utilisation des décorateurs
- **Traitement automatique** : Le framework lit les décorateurs et configure tout

Les décorateurs rendent votre code auto-documenté et éliminent le câblage manuel.

## Middleware

**Les middleware traitent les requêtes dans un pipeline.** Chaque middleware peut examiner, modifier ou arrêter une requête avant qu'elle n'atteigne votre contrôleur.

### Comment fonctionnent les middleware

Les fonctions middleware s'exécutent en séquence, chacune décidant de continuer ou non à l'étape suivante :

```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request) {
    // Vérifier l'authentification
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Unauthorized'); // S'arrêter ici
    }
    // Continuer automatiquement au middleware suivant ou au contrôleur
  }
}
```

Les middlewares fonctionnent comme les méthodes de contrôleur - vous pouvez retourner des valeurs, lancer des erreurs, ou ne rien retourner pour continuer. Utiliser `@Next()` n'est nécessaire que si vous voulez modifier la réponse.

### Niveaux de middleware

Les middleware peuvent être appliqués à différents niveaux :

```typescript
// Global : s'applique à toutes les requêtes
yasui.createServer({
  middlewares: [LoggingMiddleware]
});

// Contrôleur : s'applique à toutes les routes du contrôleur
@Controller('/users', AuthMiddleware)
export class UserController {}

// Route : s'applique à un endpoint spécifique
@Get('/', ValidationMiddleware)
getUsers() {}
```

### Pourquoi les middleware sont importants

- **Préoccupations transversales** : Gérer l'authentification, la journalisation, la validation globalement
- **Réutilisabilité** : Le même middleware peut être utilisé sur différentes routes
- **Composabilité** : Combiner plusieurs middleware pour un comportement complexe
- **Séparation** : Garder les préoccupations comme l'auth séparées de la logique métier

Les middleware vous permettent de construire des pipelines de traitement de requêtes qui sont à la fois puissants et maintenables.

## Comment tout fonctionne ensemble

Ces concepts se combinent pour créer une architecture propre :

```typescript
// 1. Le middleware traite la requête
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request) {
    // Authentifier la requête
    if (!req.headers.get('authorization')) {
      throw new HttpError(401, 'Unauthorized');
    }
    // Continuer automatiquement
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

### Le flux de requête

1. **La requête arrive** à votre API
2. **Le middleware** la traite (auth, logging, etc.)
3. **Le contrôleur** reçoit la requête via les décorateurs
4. **L'injection de dépendances** fournit les services requis
5. **Le service** effectue l'opération métier
6. **Le contrôleur** retourne le résultat
7. **Le framework** sérialise et envoie la réponse

## Avantages de cette architecture

### Séparation des préoccupations
Chaque composant a une responsabilité claire et unique :
- Les contrôleurs gèrent HTTP
- Les services gèrent la logique métier
- Les middleware gèrent les préoccupations transversales

### Testabilité
Les composants peuvent être testés en isolation :
- Tester les services sans HTTP
- Tester les contrôleurs avec des services mockés
- Tester les middleware indépendamment

### Maintenabilité
Les changements sont localisés :
- Les changements de logique métier n'affectent pas les contrôleurs
- Les changements de route n'affectent pas les services
- Les nouvelles fonctionnalités peuvent réutiliser les services existants

### Évolutivité
L'architecture supporte la croissance :
- Ajouter facilement de nouveaux contrôleurs
- Partager les services entre contrôleurs
- Composer les middleware pour des exigences complexes

## Quand utiliser quoi

### Utiliser les contrôleurs pour :
- Définir les endpoints d'API
- Extraire les données de requête
- Définir les codes de statut de réponse
- Coordonner entre services

### Utiliser les services pour :
- La logique et les règles métier
- Le traitement des données
- Les appels d'API externes
- Les opérations qui pourraient être réutilisées

### Utiliser l'injection de dépendances pour :
- Connecter les services aux contrôleurs
- Gérer les cycles de vie des objets
- Faciliter les tests
- Garder le code faiblement couplé

### Utiliser les décorateurs pour :
- Définir les routes et méthodes HTTP
- Extraire les paramètres de requête
- Configurer les middleware
- Ajouter des métadonnées pour la documentation

### Utiliser les middleware pour :
- L'authentification et l'autorisation
- La journalisation des requêtes/réponses
- La validation des entrées
- La limitation de débit
- La gestion des erreurs