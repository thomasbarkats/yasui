# Documentation API (Swagger)

YasuiJS fournit la génération de documentation OpenAPI avec une intégration optionnelle de Swagger UI. Il génère automatiquement la documentation à partir de vos décorateurs existants et vous permet de l'enrichir avec des métadonnées supplémentaires.

## Configuration

### Configuration de base

Activez Swagger en ajoutant la configuration à votre application. YasuiJS génère la documentation à partir de vos contrôleurs, routes et décorateurs.

Les assets Swagger UI sont servis depuis un CDN par défaut - **aucun package supplémentaire nécessaire**.

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    info: {
      title: 'Mon API',
      version: '1.0.0',
    },
  }
});
```

La documentation sera accessible par défaut à `/api-docs` si aucun chemin personnalisé n'est spécifié, et la spécification JSON à `/<path>/swagger.json`.

### Configuration CDN

Par défaut, YasuiJS charge les assets Swagger UI depuis le CDN jsDelivr (`https://cdn.jsdelivr.net/npm/swagger-ui-dist@5`). Vous pouvez personnaliser la source CDN ou utiliser des assets auto-hébergés :

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',

    // Utiliser un CDN alternatif (unpkg)
    cdn: 'https://unpkg.com/swagger-ui-dist@5',

    // Ou épingler à une version spécifique
    // cdn: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0',

    // Ou utiliser des assets auto-hébergés
    // cdn: '/swagger-ui',

    info: {
      title: 'Mon API',
      version: '1.0.0',
    },
  }
});
```

**Avantages du CDN :**
- ✅ Zéro installation - fonctionne immédiatement
- ✅ Fonctionne sur tous les runtimes (Node.js, Deno, Bun, environnements edge)
- ✅ Aucune dépendance au système de fichiers
- ✅ Toujours à jour avec la dernière version de Swagger UI

**Cas d'usage CDN personnalisé :**
- **CDN alternatif** : Utiliser unpkg ou d'autres fournisseurs CDN
- **Version spécifique** : Épingler à une version particulière de Swagger UI
- **CDN régional** : Utiliser un CDN plus rapide pour votre région
- **Auto-hébergé** : Servir les assets depuis votre propre serveur ou CDN
- **Hors ligne/air-gapped** : Déployer avec des assets locaux dans des environnements restreints

### Documentation auto-générée

YasuiJS génère automatiquement une documentation de base à partir de vos contrôleurs existants et des décorateurs de route, même sans aucun décorateur spécifique à Swagger. Le framework détecte :
- **Paramètres** : Les paramètres de chemin, paramètres de requête et en-têtes sont automatiquement détectés avec le type `string` par défaut
- **Corps de requête** : Automatiquement détecté lorsque présent avec le schéma `{}` par défaut
- **Réponses** : Seul le code de statut 200 (ou le statut par défaut si `@HttpStatus` est présent) est détecté sans information de schéma

Les sections suivantes décrivent comment enrichir cette documentation avec des métadonnées supplémentaires et un typage précis.

### Configuration complète

Toutes les propriétés standard de la spécification OpenAPI 3.0 sont supportées et optionnelles. Le framework gère automatiquement la génération d'`openapi`, `paths` et `components` basée sur vos décorateurs.

<details>
<summary>Voir l'exemple complet avec toutes les options de configuration</summary>

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/docs',
    // Objet Info OpenAPI
    info: {
      title: 'API de Gestion des Utilisateurs',
      version: '2.1.0',
      description: 'API complète pour les opérations de gestion des utilisateurs',
      termsOfService: 'https://example.com/terms',
      contact: {
        name: 'Support API',
        url: 'https://example.com/support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    // Documentation externe
    externalDocs: {
      description: 'Plus d\'informations ici',
      url: 'https://example.com/docs'
    },
    // Informations du serveur
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Serveur de production',
        variables: {
          version: {
            default: 'v1',
            enum: ['v1', 'v2'],
            description: 'Version de l\'API'
          }
        }
      },
      {
        url: 'https://staging.example.com/v1',
        description: 'Serveur de test'
      }
    ],
    // Exigences de sécurité globales
    security: [
      { bearerAuth: [] },
      { apiKeyAuth: [] }
    ],
    // Tags globaux
    tags: [
      {
        name: 'users',
        description: 'Opérations de gestion des utilisateurs',
        externalDocs: {
          description: 'En savoir plus',
          url: 'https://example.com/docs/users'
        }
      }
    ]
  }
});
```

</details>

## Définition de schéma

YasuiJS utilise des classes TypeScript avec des décorateurs de propriété pour définir les schémas d'API. Les propriétés sont automatiquement inférées à partir des métadonnées TypeScript lorsque les décorateurs sont utilisés sans paramètres.

Les schémas sont automatiquement enregistrés s'ils sont utilisés dans des décorateurs.

### `@ApiProperty(definition?)`
Définit une propriété, requise par défaut. Supporte plusieurs formats de définition :

```typescript
export class CreateUserDto {
  @ApiProperty() // Type inféré depuis TypeScript
  name: string;

  @ApiProperty([String]) // Tableau de primitives
  tags: string[];

  @ApiProperty(AddressDto) // Référence à une autre classe
  address: AddressDto;

  @ApiProperty([AddressDto]) // Tableau de références de classe
  previousAddresses: AddressDto[];

  @ApiProperty({ enum: ['admin', 'user'] }) // Valeurs d'énumération
  role: string;

  @ApiProperty({ enum: UserStatus }) // Énumération TypeScript
  status: UserStatus;

  // Schéma OpenAPI, personnalisation complète
  @ApiProperty({ type: 'string', format: 'email' }) 
  username: string;

  @ApiProperty({
    theme: String,
    preferences: PreferencesDto,
    categories: [String],
    addresses: [AddressDto]
  }) // Enregistrement des utilisations précédemment listées
  settings: any;
}
```

Seuls les types primitifs peuvent être inférés à partir des métadonnées TypeScript. Les types complexes (y compris les tableaux) auront par défaut `{ type: 'object' }`. Pour un typage spécifique, utilisez les formats de définition explicites montrés ci-dessus.

### `@ApiPropertyOptional(definition?)`
Équivalent à `@ApiProperty({ required: false })`

```typescript
@ApiPropertyOptional()
description?: string;

@ApiPropertyOptional({ enum: ['small', 'medium', 'large'] })
size?: string;
```

### `@ApiSchema(name)`
Définit un nom de schéma personnalisé. Le nom par défaut est le nom de la classe. Les noms de schéma doivent être uniques.

```typescript
@ApiSchema('Requête de Création d\'Utilisateur')
export class CreateUserDto {
  @ApiProperty()
  name: string;
}
```

### Alias
- `@AP()` - Alias pour `@ApiProperty()`
- `@APO()` - Alias pour `@ApiPropertyOptional()`

## Documentation des endpoints

### `@ApiBody(description?, definition?, contentType?)`
Documente le schéma du corps de requête. Le type de contenu par défaut est `application/json`.

```typescript
@Post('/users')
@ApiBody('Données utilisateur', CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```
Tous les formats de définition décrits pour @ApiProperty (schéma OpenAPI, tableau de primitives, tableau de références de classe, enregistrement, énumération...) sont valides pour @ApiBody. Les schémas de toute classe seront automatiquement résolus.

Il est aussi possible d'utiliser @ApiBody avec seulement une référence de classe sans description (ce sera le nom du schéma dans ce cas).
```ts
@Post('/users')
@ApiBody(CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```

### `@ApiResponse(statusCode, description?, definition?)`
Documente les réponses des endpoints.

```typescript
@Get('/users')
@ApiResponse(200, 'Utilisateurs', [UserDto])
getUsers() {}
```
Tous les formats de définition décrits pour @ApiProperty (schéma OpenAPI, tableau de primitives, tableau de références de classe, enregistrement, énumération...) sont valides pour @ApiResponse. Les schémas de toute classe seront automatiquement résolus.

Il est aussi possible d'utiliser @ApiResponse avec seulement une référence de classe sans description (ce sera le nom du schéma dans ce cas).
```typescript
@Get('/users/:id')
@ApiResponse(200, UserDto)
getUser(@Param('id') id: string) {}
```

### `@ApiOperation(summary, description?, tags?)`
Décrit l'opération de l'endpoint.

```typescript
@Get('/users')
@ApiOperation('Obtenir tous les utilisateurs')
getUsers() {}

@Post('/users')
@ApiOperation('Créer un utilisateur', 'Crée un nouveau compte utilisateur', ['users'])
createUser() {}
```

### Documentation des paramètres
- `@ApiParam(name, description?, required?, definition?)` - Paramètres de chemin
- `@ApiQuery(name, description?, required?, definition?)` - Paramètres de requête  
- `@ApiHeader(name, description?, required?, definition?)` - En-têtes

Tous les formats de définition décrits pour `@ApiProperty` et les décorateurs précédents sont supportés, mais gardez à l'esprit que les utilisations complexes (objets, tableaux, références de classe, etc.) peuvent ne pas avoir de sens selon la nature du décorateur, même si le schéma OpenAPI sera correctement généré.

```typescript
@Get('/users/:id')
@ApiParam('id', 'ID utilisateur', true, Number)
@ApiQuery('include', 'Inclure les données liées', false, Boolean)
@ApiHeader('Authorization', 'Token Bearer', true) // String par défaut
getUser(
  @Param('id') id: number,
  @Query('include') include?: boolean
) {}
```

## Réponses d'erreur

### `@ApiErrorResponse(statusCode, description?, ErrorDataClass?)`
Documente les réponses d'erreur avec le format d'encapsulation d'erreur YasuiJS. Ce décorateur inclut automatiquement la structure complète de schéma d'erreur du framework qui encapsule toutes les erreurs dans votre application.

```typescript
@Get('/users/:id')
@ApiErrorResponse(404, 'Utilisateur non trouvé')
@ApiErrorResponse(500, 'Erreur interne du serveur')
getUser(@Param('id') id: string) {}
```

Lorsque vous avez des classes d'erreur personnalisées qui étendent `HttpError`, vous pouvez les enrichir avec les décorateurs `@ApiProperty` et `@ApiPropertyOptional` pour documenter leurs propriétés spécifiques. Le schéma résultant fusionnera vos données d'erreur personnalisées avec l'encapsulation d'erreur standard de YasuiJS :

```typescript
@Post('/users')
@ApiErrorResponse(400, 'Échec de validation', ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}

// Aussi possible avec seulement une référence de classe (la description sera le nom du schéma)
@Post('/users')
@ApiErrorResponse(400, ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}
```

### Approche alternative
Si vous préférez une documentation d'erreur plus simple sans le format d'encapsulation complet, vous pouvez continuer à utiliser le décorateur standard `@ApiResponse` décrit précédemment. Avec `@ApiResponse`, si vous passez une classe d'erreur personnalisée étendant HttpError, vous n'obtiendrez que le schéma de cette classe spécifique sans hériter d'aucune définition d'API.

## Fonctions utilitaires

### `resolveSchema(schema: ApiPropertyDefinition): OpenAPISchema`
Résout manuellement toute définition de schéma (voir les formats décrits dans la section @ApiProperty) au format OpenAPI. Utile pour des cas d'usage spécifiques.

```typescript
import { resolveSchema } from 'yasui';
const schema = resolveSchema(CreateUserDto);
```