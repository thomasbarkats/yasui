# Service de Journalisation

YasuiJS inclut un service de journalisation intégré avec des capacités de chronométrage et une sortie codée par couleur. Il fournit une journalisation structurée pour votre application avec un contexte spécifique aux requêtes et une surveillance des performances.

Le logger peut être injecté dans les services et contrôleurs via l'injection de constructeur, ou accessible directement dans les paramètres de méthode en utilisant le décorateur `@Logger()`.

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

### Injection de Constructeur

Injectez le service de logger dans vos constructeurs de service ou contrôleur :

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

### Accès au Niveau Méthode

- `@Logger()` - Obtenir une instance de logger spécifique à la requête (aucun paramètre)

Utilisez le décorateur `@Logger()` pour obtenir une instance de logger dédiée qui est automatiquement démarrée au début de la route. Ceci est utile pour suivre le chronométrage tout au long de l'opération en mode debug. Cela fonctionne à la fois dans les méthodes de contrôleur et les méthodes de middleware.

```typescript
import { LoggerService } from 'yasui';

@Controller('/api/users')
export class UserController {
  @Get('/')
  getUsers(@Logger() logger: LoggerService) {
    logger.log('Traitement de la requête de liste d\'utilisateurs');
    // Le logger est déjà démarré, le chronométrage est automatique
    const users = this.fetchUsers();
    logger.success(`Trouvé ${users.length} utilisateurs`);
    return users;
  }
}

@Middleware()
export class RequestLoggerMiddleware {
  use(
    @Req() req: Request,
    @Logger() logger: LoggerService
  ) {
    logger.log('Requête entrante', { method: req.method, path: req.path });
  }
}
```

## Méthodes de Journalisation

Le LoggerService fournit plusieurs méthodes pour différents niveaux de log :

```typescript
@Injectable()
export class ExampleService {
  constructor(private logger: LoggerService) {}

  demonstrateLogs() {
    // Informations générales
    this.logger.log('Application démarrée');
    // Informations de debug (détaillées)
    this.logger.debug('Informations de debug', { details: 'données supplémentaires' });
    // Messages de succès
    this.logger.success('Opération terminée avec succès');
    // Messages d'avertissement
    this.logger.warn('Avertissement : méthode dépréciée utilisée');
    // Messages d'erreur
    this.logger.error('Erreur survenue', { error: 'détails' });
  }
}
```

## Fonctionnalité de Chronométrage

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

## Intégration du Mode Debug

Lorsque le mode debug est activé dans votre configuration YasuiJS, le logger fournit une sortie plus verbeuse :

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true // Active la journalisation détaillée
});
```

En mode debug :
- Toutes les requêtes entrantes sont automatiquement journalisées
- Les messages de debug sont affichés
- Des informations d'erreur plus détaillées sont montrées