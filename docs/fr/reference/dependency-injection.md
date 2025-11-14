# Injection de Dépendances

YasuiJS fournit un système complet d'injection de dépendances avec résolution automatique des dépendances et gestion de la portée. Il permet un couplage faible, une meilleure testabilité et une séparation plus claire des préoccupations.

## Aperçu

L'injection de dépendances gère automatiquement les relations entre les composants. Au lieu de créer et de connecter manuellement des objets, YasuiJS le fait pour vous en analysant les constructeurs de classes et les paramètres de méthodes.

```typescript
import { Injectable, Controller } from 'yasui';

@Injectable()
export class UserService {
  getUsers() {
    return [{ id: 1, name: 'John' }];
  }
}

@Controller('/users')
export class UserController {
  // UserService est automatiquement créé et injecté
  constructor(private userService: UserService) {}

  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

## Services Injectables

### Décorateur Injectable

- `@Injectable()` - Marquer une classe comme injectable (pas de paramètres, requis pour tous les services)

Utilisez le décorateur `@Injectable()` pour marquer une classe comme injectable. Ce décorateur est **requis** pour tous les services qui seront injectés.

```typescript
import { Injectable } from 'yasui';

@Injectable()
export class UserService {
  getUser(id: string) {
    // Logique métier ici
    return { id, name: 'John Doe' };
  }
}

@Injectable()
export class EmailService {
  sendEmail(to: string, subject: string) {
    // Logique d'email ici
    console.log(`Envoi d'email à ${to}: ${subject}`);
  }
}
```

## Injection par Constructeur

Déclarez simplement vos dépendances dans les constructeurs de contrôleurs, middlewares ou services. Vous pouvez injecter plusieurs services dans le même constructeur. Ils seront automatiquement résolus et injectés :

```typescript
@Injectable()
export class OrderService {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private paymentService: PaymentService
  ) {}

  processOrder(orderData: any) {
    const user = this.userService.getUser(orderData.userId);
    const payment = this.paymentService.processPayment(orderData.amount);
    this.emailService.sendEmail(user.email, 'Commande confirmée');
    
    return { order: orderData, payment };
  }
}
```

## Portées des Dépendances

### Décorateur Scope

- `@Scope(scope)` - Spécifier la portée de la dépendance (paramètre de portée requis)

YasuiJS prend en charge trois portées différentes qui contrôlent comment les instances sont créées et partagées :

- **`Scopes.SHARED`** (par défaut) : Instance singleton partagée dans toute l'application
- **`Scopes.LOCAL`** : Nouvelle instance pour chaque contexte d'injection
- **`Scopes.DEEP_LOCAL`** : Nouvelle instance qui propage la localité à ses propres dépendances

Le décorateur `@Scope()` est appliqué au point d'injection, pas sur la classe de service elle-même.

### Portées au niveau du Constructeur

Vous pouvez spécifier des portées pour des dépendances individuelles dans les constructeurs :

```typescript
@Injectable()
export class MyService {
  constructor(
    @Scope(Scopes.LOCAL) private tempService: TempService,
    @Scope(Scopes.DEEP_LOCAL) private isolatedService: IsolatedService,
    private sharedService: SharedService // SHARED par défaut
  ) {}
}
```

### Directives de Sélection de Portée

- **SHARED** : Utiliser pour les services sans état, les caches, les connexions de base de données
- **LOCAL** : Utiliser pour les services spécifiques aux requêtes, les processeurs temporaires
- **DEEP_LOCAL** : Utiliser pour les opérations complètement isolées, les scénarios de test

## Injection au niveau des Méthodes

### Décorateur Inject

- `@Inject(token?)` - Injecter des dépendances dans les paramètres de méthode (token personnalisé optionnel)

Vous pouvez injecter des dépendances directement dans les paramètres de méthode des contrôleurs ou middlewares. Cela restreint l'injection à des points d'entrée spécifiques au lieu du contrôleur entier, permettant une gestion fine de la portée. Par exemple, vous pouvez avoir un service partagé injecté dans le constructeur, mais une route spécifique qui nécessite une instance dédiée du même service.

```typescript
@Controller('/users')
export class UserController {

  // Instance partagée pour le contrôleur
  constructor(private userService: UserService) {}

  @Get('/:id')
  getUser(
    @Param('id') id: string,
    @Inject() userService: UserService // Instance spécifique à ce point d'entrée
  ) {
    return userService.getUser(id);
  }
}
```

### Portées au niveau des Méthodes

Les portées fonctionnent également avec l'injection au niveau des méthodes :

```typescript
@Controller('/api')
export class ApiController {
  @Get('/data')
  getData(
    @Inject() @Scope(Scopes.LOCAL) tempService: TempService,
    @Inject() @Scope(Scopes.SHARED) cacheService: CacheService
  ) {
    return tempService.processData(cacheService.getData());
  }
}
```

## Tokens d'Injection Personnalisés

### Utilisation des Tokens Personnalisés

Pour les scénarios complexes, utilisez des tokens d'injection personnalisés avec `@Inject()`. C'est utile pour injecter des valeurs primitives, des configurations, ou lorsque vous avez besoin de plusieurs instances de la même classe :

```typescript
@Injectable()
export class DatabaseService {
  constructor(
    @Inject('DATABASE_URL') private dbUrl: string,
    @Inject('CONFIG') private config: AppConfig
  ) {
    console.log(`Connexion à : ${this.dbUrl}`);
  }
}

@Controller('/users')
export class UserController {
  @Get('/')
  getUsers(
    @Inject('API_VERSION') apiVersion: string,
    @Inject() userService: UserService
  ) {
    return {
      version: apiVersion,
      users: userService.getAllUsers()
    };
  }
}
```

### Enregistrement des Tokens Personnalisés

Enregistrez les tokens personnalisés dans votre configuration d'application en utilisant `provide` pour les valeurs directes ou `factory` pour les valeurs calculées :

```typescript
yasui.createServer({
  controllers: [UserController],
  injections: [
    // Valeur directe
    { token: 'API_KEY', provide: process.env.API_KEY },
    // Factory asynchrone
    {
      token: 'DATABASE',
      factory: async () => {
        const db = new Database();
        await db.connect();
        return db;
      }
    }
  ]
});
```

Par défaut, toutes les injections de factory sont résolues avant le démarrage du serveur.

### Injections Asynchrones Différées {#deferred-deps}

Utilisez `deferred: true` pour les dépendances qui ne doivent pas bloquer le démarrage du serveur et dont l'absence temporaire ou l'erreur est acceptée. Le serveur démarre immédiatement pendant que la dépendance s'initialise en arrière-plan.

**Comment ça fonctionne :**

- Le serveur démarre immédiatement (non bloquant)
- Le service est `null` jusqu'à ce que la factory se résolve
- **Le développeur gère l'état null** (retourner 503, ignorer l'opération, utiliser un repli, etc.)
- Une fois initialisé, le service fonctionne normalement
- Si l'initialisation échoue, le service reste `null`

<details>
<summary>Cliquez pour voir l'exemple complet</summary>

```typescript
import { Inject, HttpError } from 'yasui';

yasui.createServer({
  controllers: [AnalyticsController],
  injections: [{
    token: 'ANALYTICS',
    deferred: true,
    factory: async () => {
      try {
        const analytics = new AnalyticsClient();
        await analytics.connect();
        return analytics;
      } catch (err) {
        // Faire quelque chose, comme envoyer une alerte.
        throw err; // Le service restera null
      }
    },
  }]
});

export class AnalyticsController {
  // YasuiJS vous oblige à typer avec union null
  constructor(
    @Inject('ANALYTICS') private analytics: AnalyticsService | null
  ) { }

  @Get('/events')
  getEvents() {
    // Gérer l'état non prêt/échoué :
    if (!this.analytics) {
      throw new HttpError(503, 'Analytics not ready');   // ex. retourner 503
      // OU : return { events: [] };                     // Valeur de repli
      // OU : this.logger.warn('Analytics unavailable'); // Ignorer l'opération
      //     return ;
    }
    return this.analytics.track('page_view');
  }
}
```
</details>

**Exigences importantes de typage :**

YasuiJS valide que les injections différées sont typées avec `| null` **uniquement pour les types Classe**. Ceci est dû aux limitations des métadonnées de réflexion TypeScript.

✅ **Fonctionne** (types Classe) :

Une erreur de validation de décorateur sera générée au démarrage de YasuiJS si `| null` est manquant :
```typescript
@Inject('TOKEN') service: MyService | null // ✅ Validé
```

❌ **Non validé** (compilera mais ne sera pas vérifié) :
```typescript
@Inject('TOKEN') config: object | null         // ⚠️ Non validé (type littéral)
@Inject('TOKEN') data: { foo: string } | null  // ⚠️ Non validé (type en ligne)
```

### Dépendances Circulaires

YasuiJS détecte et empêche automatiquement les dépendances circulaires au démarrage :

```typescript
// Ceci sera détecté et signalé comme une erreur
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // Dépendance circulaire !
}
```