# Documentation API (Swagger)

YasuiJS fournit une génération de documentation OpenAPI avec une intégration optionnelle de Swagger UI. Il génère automatiquement la documentation à partir de vos décorateurs existants et vous permet de l'améliorer avec des métadonnées supplémentaires.

## Configuration

### Configuration de base

Activez Swagger en ajoutant la configuration à votre application. YasuiJS génère automatiquement la documentation à partir de vos contrôleurs, routes et décorateurs.

**Remarque**: Vous devez installer `swagger-ui-express` séparément:
```bash
npm install swagger-ui-express
```

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    info: {
      title: 'My API',
      version: '1.0.0'
    }
  }
});
```

La documentation sera accessible à `/api-docs` (chemin par défaut) et la spécification JSON à `/api-docs.json`.

### Configuration complète

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    path: '/docs', // Chemin personnalisé
    info: {
      title: 'User Management API',
      version: '2.1.0',
      description: 'Complete API for user management operations',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'https://api.example.com/v1',
        description: 'Production server'
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ]
  }
});
```

## Documentation améliorée

Enrichissez la documentation API par défaut avec des décorateurs optionnels. Tous les décorateurs sont attachés à la méthode du point de terminaison:

### Opération API

- `@ApiOperation(summary, description?, tags?)` - Décrit le point de terminaison

```typescript
import { ApiOperation } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/')
  @ApiOperation('Get all users', 'Retrieve a list of all users in the system', ['users'])
  getUsers() {
    return this.userService.getAllUsers();
  }

  @Post('/')
  @ApiOperation('Create user', 'Create a new user account')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Documentation des paramètres

- `@ApiParam(name, description?, required?, schema?)` - Documente les paramètres de chemin
- `@ApiQuery(name, description?, required?, schema?)` - Documente les paramètres de requête  
- `@ApiHeader(name, description?, required?, schema?)` - Documente les en-têtes

```typescript
import { ApiParam, ApiQuery, ApiHeader } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiParam('id', 'User unique identifier', true, { type: 'string' })
  @ApiHeader('Authorization', 'Bearer token for authentication', true)
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Get('/')
  @ApiQuery('page', 'Page number for pagination', false, { type: 'number', default: 1 })
  @ApiQuery('limit', 'Number of items per page', false, { type: 'number', default: 10 })
  getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getUsers({ page, limit });
  }
}
```

### Documentation du corps de la requête

- `@ApiBody(description?, schema?)` - Documente le corps de la requête

```typescript
import { ApiBody } from 'yasui';

@Controller('/users')
export class UserController {
  @Post('/')
  @ApiBody('User creation data', {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'User full name' },
      email: { type: 'string', format: 'email', description: 'User email address' },
      age: { type: 'number', minimum: 18, description: 'User age (must be 18+)' }
    },
    required: ['name', 'email']
  })
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

### Documentation des réponses

- `@ApiResponse(statusCode, description, schema?)` - Documente les réponses

```typescript
import { ApiResponse } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiResponse(200, 'User found successfully', {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      email: { type: 'string' },
      createdAt: { type: 'string', format: 'date-time' }
    }
  })
  @ApiResponse(404, 'User not found')
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  @ApiResponse(201, 'User created successfully')
  @ApiResponse(400, 'Invalid user data')
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```

## Réponses d'erreur

`ErrorResourceSchema` génère un schéma pour le format d'encapsulation d'erreur de YasuiJS. Vous pouvez éventuellement définir des champs supplémentaires qui seront inclus dans la propriété `data` pour vos erreurs personnalisées:

```typescript
import { ApiResponse, ErrorResourceSchema } from 'yasui';

@Controller('/users')
export class UserController {
  @Get('/:id')
  @ApiResponse(404, 'User not found', ErrorResourceSchema())
  getUser(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Post('/')
  @ApiResponse(400, 'Validation failed', ErrorResourceSchema({
    fields: { 
      type: 'array', 
      items: { type: 'string' },
      description: 'List of invalid fields' 
    }
  }, {
    fields: ['email', 'password']
  }))
  createUser(@Body() userData: any) {
    return this.userService.createUser(userData);
  }
}
```