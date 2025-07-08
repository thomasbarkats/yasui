# Service de journalisation

YasuiJS inclut un service de journalisation intégré avec des capacités de chronométrage et une sortie en couleur. Il fournit une journalisation structurée pour votre application avec un contexte spécifique aux requêtes et une surveillance des performances.

Le logger peut être injecté dans les services et les contrôleurs via l'injection par constructeur, ou accessible directement dans les paramètres de méthode en utilisant le décorateur `@Logger()`.

```typescript
import { Injectable, LoggerService } from 'yasui';

@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  getUser(id: string) {
    this.logger.log('Récupération de l\'utilisateur', { userId: id });
    const user = this.findUser(id);
    this.logger.success('Utilisateur trouvé avec succès');
    return user;
  }
}
```

## Utilisation de LoggerService

### Injection par constructeur

Injectez le service de journalisation dans les constructeurs de vos services ou contrôleurs :

```typescript
@Injectable()
export class UserService {
  constructor(private readonly logger: LoggerService) {}

  createUser(userData: any) {
    this.logger.log('Création d\'un nouvel utilisateur');
    // Logique métier ici
    this.logger.success('Utilisateur créé avec succès');
  }
}

@Controller('/users')
export class UserController {
  constructor(private readonly logger: LoggerService) {}

  @Get('/')
  getUsers() {
    this.logger.log('Récupération de tous les utilisateurs');
    return this.userService.getAllUsers();
  }
}
```

### Accès au niveau de la méthode

- `@Logger()` - Obtenir une instance de logger spécifique à la requête (pas de paramètres)

Utilisez le décorateur `@Logger()` pour obtenir une instance de logger dédiée qui est automatiquement démarrée au début de la route. Ceci est utile pour suivre le chronométrage tout au long de l'opération en mode debug. Cela fonctionne à la fois dans les méthodes de contrôleur et les méthodes de middleware.

```typescript
import { LoggerService } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Logger() logger: LoggerService) {
    logger.log('Traitement de la demande de liste d\'utilisateurs');
    // Le logger est déjà démarré, le chronométrage est automatique
    const users = this.fetchUsers();
    logger.success(`${users.length} utilisateurs trouvés`);
    return users;
  }
}

@Middleware()
export class RequestLoggerMiddleware {
  use(
    @Req() req: Request,
    @Logger() logger: LoggerService,
    @Next() next: NextFunction
  ) {
    logger.log('Requête entrante', { method: req.method, path: req.path });
    next();
  }
}
```

## Méthodes de journalisation

Le LoggerService fournit plusieurs méthodes pour différents niveaux de journalisation :

```typescript
@Injectable()
export class ExampleService {
  constructor(private logger: LoggerService) {}

  demonstrateLogs() {
    // Information générale
    this.logger.log('Application démarrée');
    // Information de débogage (détaillée)
    this.logger.debug('Information de débogage', { details: 'données supplémentaires' });
    // Messages de succès
    this.logger.success('Opération terminée avec succès');
    // Messages d'avertissement
    this.logger.warn('Avertissement : méthode obsolète utilisée');
    // Messages d'erreur
    this.logger.error('Erreur survenue', { error: 'détails' });
  }
}
```

## Fonctionnalité de chronométrage

Le logger inclut des capacités de chronométrage intégrées pour la surveillance des performances :

```typescript
@Injectable()
export class DataService {
  constructor(private logger: LoggerService) {}

  processData() {
    this.logger.start(); // Démarrer le chronomètre
    
    const data = this.fetchData();
    const elapsed = this.logger.stop(); // Arrêter et obtenir le temps écoulé
    this.logger.log(`Traitement terminé en ${elapsed}ms`);
    
    return data;
  }

  batchProcess(items: any[]) {
    this.logger.start();
    
    for (const item of items) {
      this.processItem(item);
      this.logger.reset(); // Réinitialiser le chronomètre pour l'élément suivant
    }
    
    // Obtenir le temps écoulé actuel sans arrêter
    const currentTime = this.logger.getTime();
    this.logger.debug(`Temps de traitement actuel : ${currentTime}ms`);
  }
}
```

## Intégration du mode débogage

Lorsque le mode débogage est activé dans votre configuration YasuiJS, le logger fournit une sortie plus détaillée :

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true // Active la journalisation détaillée
});
```

En mode débogage :
- Toutes les requêtes entrantes sont automatiquement journalisées
- Les messages de débogage sont affichés
- Des informations d'erreur plus détaillées sont affichées