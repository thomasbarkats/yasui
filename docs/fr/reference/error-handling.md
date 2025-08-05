# Gestion des Erreurs

YasuiJS fournit une gestion et un formatage automatiques des erreurs pour la journalisation et les réponses client. Toutes les méthodes du contrôleur sont automatiquement encapsulées avec une gestion des erreurs pour capturer et traiter les erreurs levées.

## Aperçu

Lorsqu'une erreur se produit dans votre application, YasuiJS automatiquement :
- Enregistre l'erreur avec des informations détaillées (URL, méthode, statut, message)
- La formate et l'envoie au client sous forme de réponse JSON
- Inclut le code de statut HTTP, les détails de l'erreur, les informations de la requête et toutes les données d'erreur supplémentaires

```typescript
@Get('/:id')
getUser(@Param('id') id: string) {
  const user = this.userService.findById(id);

  if (!user) {
    // Cette erreur sera automatiquement capturée et formatée
    throw new Error('Utilisateur non trouvé');
  }
  return user;
}
```

## Gestion Personnalisée des Erreurs

### Classe HttpError

Le statut HTTP par défaut renvoyé si vous levez une `Error` sera 500 (Erreur Interne du Serveur). Pour spécifier le statut HTTP de retour correspondant à votre erreur, levez un `HttpError` :

```typescript
import { HttpError, HttpCode } from 'yasui';

@Controller('/users')
export class UserController {

 @Get('/:id')
 getUser(@Param('id') id: string) {
   const user = this.userService.findById(id);

   if (!user) {
     throw new HttpError(HttpCode.NOT_FOUND, `Utilisateur ${id} non trouvé`);
   }
   return user;
 }
}
```

Vous pouvez spécifier un code comme un nombre (ex. 400) ou utiliser l'énumération fournie `HttpCode` comme dans l'exemple. Pour une liste complète des codes de statut HTTP et leurs significations, consultez la [documentation des codes de statut de réponse HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status).

### Classes d'Erreur Personnalisées

Créez des erreurs personnalisées avec des codes de statut spécifiques et des données supplémentaires en étendant ou en utilisant la classe `HttpError`. Votre erreur personnalisée doit définir les propriétés `status` et `message` en appelant le constructeur parent, et peut inclure des propriétés supplémentaires.

```typescript
class ValidationError extends HttpError {
  fields: string[];

  constructor(fields: string[]) {
    super(HttpCode.BAD_REQUEST, 'Champs requis manquants');
    this.fields = fields;
  }
}

@Controller('/users')
export class UserController {

  @Post('/')
  createUser(@Body() userData: any) {
    const missingFields = this.validateUserData(userData);

    if (missingFields.length > 0) {
      throw new ValidationError(missingFields);
    }
    return this.userService.createUser(userData);
  }
}
```
Les propriétés supplémentaires seront incluses dans la réponse formatée de Yasui.

## Format de Réponse d'Erreur

Lorsqu'une erreur est levée, YasuiJS la formate automatiquement en une réponse JSON cohérente :

```json
{
  "url": "http://localhost:3000/api/users/123",
  "path": "/api/users/123",
  "method": "POST",
  "name": "ValidationError", // Nom de la classe d'erreur
  "message": "Champs requis manquants",
  "statusMessage": "Bad Request", // Message de statut HTTP
  "status": 404, // Code de statut HTTP
  "data": {
    "fields": ["name", "age"]
  }
}
```

Les propriétés des erreurs personnalisées héritant de HttpError seront incluses dans `data`.

## Gestion des Erreurs dans les Services

Les services ou tout Injectable peuvent lever des erreurs qui seront automatiquement capturées lorsqu'elles sont appelées depuis les contrôleurs :

```typescript
@Injectable()
export class UserService {

  findById(id: string) {
    const user = this.database.findUser(id);
    if (!user) {
      // Ceci sera capturé par le gestionnaire d'erreurs du contrôleur
      throw new HttpError(HttpCode.NOT_FOUND, 'Utilisateur non trouvé');
    }
    return user;
  }
}
```

## Journaux d'erreurs

En mode debug (option `debug` dans la configuration Yasui), toutes les erreurs renvoyées par les points de terminaison seront journalisées. En production, seules les erreurs 500 (Erreur Interne du Serveur) seront journalisées, considérant qu'elles sont inattendues et ne sont généralement pas des erreurs métier.

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

// Le décorateur de paramètre manquant sera détecté
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
  enableDecoratorValidation: false // Non sécurisé - désactive la validation
});
```
