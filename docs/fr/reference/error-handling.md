# Gestion des Erreurs

YasuiJS fournit une gestion et un formatage automatiques des erreurs pour la journalisation et les réponses client. Toutes les méthodes de contrôleur sont automatiquement enveloppées avec une gestion d'erreurs pour capturer et traiter toutes les erreurs levées.

## Aperçu

Lorsqu'une erreur se produit dans votre application, YasuiJS automatiquement :
- Enregistre l'erreur avec des informations détaillées (URL, méthode, statut, message)
- Formate et l'envoie au client sous forme de réponse JSON
- Inclut le code de statut HTTP, les détails de l'erreur, les informations de la requête et toutes données d'erreur supplémentaires

```typescript
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.findById(id);
    
    if (!user) {
      // Cette erreur sera automatiquement capturée et formatée
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    return user;
  }
}
```

## Gestion d'Erreurs Personnalisée

### Classe HttpError

Créez des erreurs personnalisées avec des codes de statut spécifiques et des données supplémentaires en étendant ou en utilisant la classe `HttpError`. Votre erreur personnalisée doit définir les propriétés `status` et `message` et peut inclure toutes propriétés supplémentaires.

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/users')
export class UserController {
 @Get('/:id')
 getUser(@Param('id') id: string) {
   const user = this.userService.findById(id);
   
   if (!user) {
     throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
   }
   
   return user;
 }
}
```

### Classes d'Erreur Personnalisées

Créez des classes d'erreur personnalisées pour des erreurs de logique métier spécifiques :

```typescript
class ValidationError extends HttpError {
  fields: string[];

  constructor(message: string, fields: string[]) {
    super(HttpCode.BAD_REQUEST, message);
    this.fields = fields;
  }
}

@Controller('/users')
export class UserController {
  @Post('/')
  createUser(@Body() userData: any) {
    const missingFields = this.validateUserData(userData);
    
    if (missingFields.length > 0) {
      throw new ValidationError('Missing required fields', missingFields);
    }
    
    return this.userService.createUser(userData);
  }
}
```

## Enum HttpCode

YasuiJS fournit une énumération `HttpCode` avec les codes de statut HTTP courants. Pour une liste complète des codes de statut HTTP et leurs significations, consultez la [documentation des codes de statut de réponse HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

```typescript
import { HttpCode } from 'yasui';

@Controller('/api')
export class ApiController {
  @Delete('/:id')
  deleteItem(@Param('id') id: string) {
    if (!this.service.exists(id)) {
      throw new HttpError(HttpCode.NOT_FOUND, 'Item not found');
    }
    
    this.service.delete(id);
  }
}
```

## Format de Réponse d'Erreur

Lorsqu'une erreur est levée, YasuiJS la formate automatiquement en une réponse JSON cohérente :

```json
{
  "error": {
    "status": 404,
    "message": "User not found",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/users/123",
    "method": "GET",
    "data": {
      "resourceType": "User",
      "resourceId": "123"
    }
  }
}
```

La réponse inclut :
- **status** : Code de statut HTTP
- **message** : Message d'erreur
- **timestamp** : Quand l'erreur s'est produite
- **path** : Chemin de la requête où l'erreur s'est produite
- **method** : Méthode HTTP
- **data** : Toutes propriétés supplémentaires de votre erreur personnalisée

## Gestion des Erreurs dans les Services

Les services peuvent lever des erreurs qui seront automatiquement capturées lorsqu'ils sont appelés depuis les contrôleurs :

```typescript
@Injectable()
export class UserService {
  findById(id: string) {
    const user = this.database.findUser(id);
    
    if (!user) {
      // Ceci sera capturé par le gestionnaire d'erreurs du contrôleur
      throw new HttpError(HttpCode.NOT_FOUND, 'User not found');
    }
    
    return user;
  }

  createUser(userData: any) {
    if (this.emailExists(userData.email)) {
      throw new HttpError(HttpCode.CONFLICT, 'Email already exists', {
        email: userData.email,
        suggestion: 'Try logging in instead'
      });
    }
    
    return this.database.createUser(userData);
  }
}
```

## Validation des Décorateurs

YasuiJS valide automatiquement vos décorateurs au démarrage pour détecter les erreurs de configuration courantes. Ces erreurs sont signalées après l'initialisation du serveur mais n'empêchent pas le serveur de fonctionner :

```typescript
// Ceci sera détecté et signalé comme une erreur
@Injectable()
export class ServiceA {
  constructor(private serviceB: ServiceB) {}
}

@Injectable()
export class ServiceB {
  constructor(private serviceA: ServiceA) {} // Dépendance circulaire détectée !
}

// Un décorateur de paramètre manquant sera détecté
@Controller('/users')
export class UserController {
  @Get('/:id')
  getUser(id: string) { // Décorateur @Param('id') manquant
    return this.userService.findById(id);
  }
}
```

Vous pouvez désactiver la validation des décorateurs dans la configuration (non recommandé) :

```typescript
yasui.createServer({
  controllers: [UserController],
  enableDecoratorValidation: false // Dangereux - désactive la validation
});
```