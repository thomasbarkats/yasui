# Documentation API (Swagger)

YasuiJS fournit la génération de documentation OpenAPI avec une intégration optionnelle de Swagger UI. Il génère automatiquement la documentation à partir de vos décorateurs existants et vous permet de l'enrichir avec des métadonnées supplémentaires.

## Configuration

### Configuration de base

Activez Swagger en ajoutant la configuration à votre application. YasuiJS génère la documentation à partir de vos contrôleurs, routes et décorateurs.

**Note**: Vous devez installer `swagger-ui-express` séparément :
```bash
npm install swagger-ui-express
```

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

YasuiJS génère automatiquement une documentation de base à partir de vos contrôleurs et décorateurs de route existants, même sans décorateurs spécifiques à Swagger. Le framework détecte :
- **Paramètres** : Les paramètres de chemin, les paramètres de requête et les en-têtes sont automatiquement détectés avec le type `string` par défaut
- **Corps de la requête** : Automatiquement détecté lorsque présent avec un schéma `{}` par défaut
- **Réponses** : Seul le code d'état 200 (ou l'état par défaut si `@HttpStatus` est présent) est détecté sans information de schéma

Les sections suivantes décrivent comment enrichir cette documentation avec des métadonnées supplémentaires et un typage précis.

### Configuration complète

Toutes les propriétés de spécification OpenAPI 3.0 standard sont prises en charge et optionnelles. Le framework gère automatiquement la génération de `openapi`, `paths` et `components` basée sur vos décorateurs.

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
    // Documentation Externe
    externalDocs: {
      description: 'Plus d\'informations ici',
      url: 'https://example.com/docs'
    },
    // Information sur les Serveurs
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
        description: 'Serveur de staging'
      }
    ],
    // Exigences de Sécurité Globales
    security: [
      { bearerAuth: [] },
      { apiKeyAuth: [] }
    ],
    // Tags Globaux
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

## Définition du Schéma

YasuiJS utilise des classes TypeScript avec des décorateurs de propriété pour définir les schémas API. Les propriétés sont automatiquement déduites des métadonnées TypeScript lorsque les décorateurs sont utilisés sans paramètres.

Les schémas sont automatiquement enregistrés s'ils sont utilisés dans des décorateurs.

### `@ApiProperty(definition?)`
Définit une propriété, requise par défaut. Prend en charge plusieurs formats de définition :

```typescript
export class CreateUserDto {
  @ApiProperty() // Type déduit de TypeScript
  name: string;

  @ApiProperty([String]) // Tableau de types primitifs
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

Seuls les types primitifs peuvent être déduits des métadonnées TypeScript. Les types complexes (y compris les tableaux) seront par défaut `{ type: 'object' }`. Pour un typage spécifique, utilisez les formats de définition explicites montrés ci-dessus.

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

## Documentation des Points de Terminaison

### `@ApiBody(description?, definition?, contentType?)`
Documente le schéma du corps de la requête. Le type de contenu par défaut est `application/json`.

```typescript
@Post('/users')
@ApiBody('Données utilisateur', CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```
Tous les formats de définition décrits pour @ApiProperty (schéma OpenAPI, Tableau de primitifs, Tableau de références de classe, Enregistrement, Énumération...) sont valides pour @ApiBody. Les schémas de toute classe seront automatiquement résolus.

Il est également possible d'utiliser @ApiBody avec une référence de classe uniquement sans description (ce sera le nom du schéma dans ce cas).
```ts
@Post('/users')
@ApiBody(CreateUserDto)
createUser(@Body() data: CreateUserDto) {}
```

### `@ApiResponse(statusCode, description?, definition?)`
Documente les réponses des points de terminaison.

```typescript
@Get('/users')
@ApiResponse(200, 'Utilisateurs', [UserDto])
getUsers() {}
```
Tous les formats de définition décrits pour @ApiProperty (schéma OpenAPI, Tableau de primitifs, Tableau de références de classe, Enregistrement, Énumération...) sont valides pour @ApiResponse. Les schémas de toute classe seront automatiquement résolus.

Il est également possible d'utiliser @ApiResponse avec une référence de classe uniquement sans description (ce sera le nom du schéma dans ce cas).
```typescript
@Get('/users/:id')
@ApiResponse(200, UserDto)
getUser(@Param('id') id: string) {}
```

### `@ApiOperation(summary, description?, tags?)`
Décrit l'opération du point de terminaison.

```typescript
@Get('/users')
@ApiOperation('Obtenir tous les utilisateurs')
getUsers() {}

@Post('/users')
@ApiOperation('Créer un utilisateur', 'Crée un nouveau compte utilisateur', ['utilisateurs'])
createUser() {}
```

### Documentation des Paramètres
- `@ApiParam(name, description?, required?, definition?)` - Paramètres de chemin
- `@ApiQuery(name, description?, required?, definition?)` - Paramètres de requête
- `@ApiHeader(name, description?, required?, definition?)` - En-têtes

Tous les formats de définition décrits pour `@ApiProperty` et les décorateurs précédents sont pris en charge, mais gardez à l'esprit que les utilisations complexes (objets, tableaux, références de classe, etc.) peuvent ne pas avoir de sens selon la nature du décorateur, même si le schéma OpenAPI sera correctement généré.

```typescript
@Get('/users/:id')
@ApiParam('id', 'ID de l\'utilisateur', true, Number)
@ApiQuery('include', 'Inclure les données associées', false, Boolean)
@ApiHeader('Authorization', 'Jeton Bearer', true) // String par défaut
getUser(
  @Param('id') id: number,
  @Query('include') include?: boolean
) {}
```

## Réponses d'Erreur

### `@ApiErrorResponse(statusCode, description?, ErrorDataClass?)`
Documente les réponses d'erreur avec le format d'enveloppe d'erreur YasuiJS. Ce décorateur inclut automatiquement la structure de schéma d'erreur complète du framework qui enveloppe toutes les erreurs dans votre application.

```typescript
@Get('/users/:id')
@ApiErrorResponse(404, 'Utilisateur non trouvé')
@ApiErrorResponse(500, 'Erreur interne du serveur')
getUser(@Param('id') id: string) {}
```

Lorsque vous avez des classes d'erreur personnalisées qui étendent `HttpError`, vous pouvez les enrichir avec les décorateurs `@ApiProperty` et `@ApiPropertyOptional` pour documenter leurs propriétés spécifiques. Le schéma résultant fusionnera vos données d'erreur personnalisées avec l'enveloppe d'erreur standard de YasuiJS :

```typescript
@Post('/users')
@ApiErrorResponse(400, 'Échec de la validation', ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}

// Également possible avec une référence de classe uniquement (la description sera le nom du schéma)
@Post('/users')
@ApiErrorResponse(400, ValidationErrorData)
createUser(@Body() data: CreateUserDto) {}
```

### Approche alternative
Si vous préférez une documentation d'erreur plus simple sans le format d'enveloppe complet, vous pouvez continuer à utiliser le décorateur standard `@ApiResponse` décrit précédemment. Avec `@ApiResponse`, si vous passez une classe d'erreur personnalisée étendant HttpError, vous n'obtiendrez que le schéma de cette classe spécifique sans hériter des définitions API.

## Fonctions Utilitaires

### `resolveSchema(schema: ApiPropertyDefinition): OpenAPISchema`
Résout manuellement toute définition de schéma (voir les formats décrits dans la section @ApiProperty) au format OpenAPI. Utile pour des cas d'utilisation spécifiques.

```typescript
import { resolveSchema } from 'yasui';
const schema = resolveSchema(CreateUserDto);
```
