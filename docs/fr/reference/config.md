# Configuration

Référence complète de configuration pour les applications YasuiJS utilisant `yasui.createServer()` et `yasui.createApp()`.

## Aperçu

YasuiJS propose deux méthodes principales pour créer votre application :

- **`yasui.createServer(config)`** - Crée et démarre automatiquement un serveur HTTP
- **`yasui.createApp(config)`** - Renvoie une application Express pour une configuration manuelle

Les deux méthodes acceptent le même objet de configuration avec les options suivantes.

## Options de Configuration

### Options Requises

#### `controllers`
**Type:** `Array<Constructor>`  
**Description:** Tableau des classes de contrôleurs à enregistrer dans votre application.

```typescript
import { UserController, ProductController } from './controllers';

yasui.createServer({
  controllers: [UserController, ProductController]
});
```

### Options Facultatives

#### `middlewares`
**Type:** `Array<Constructor | RequestHandler>`  
**Défaut:** `[]`  
**Description:** Tableau de middlewares globaux à appliquer à toutes les requêtes. Peut être des classes middleware YasuiJS ou des fonctions RequestHandler Express.

```typescript
import { LoggingMiddleware } from './middleware';
import cors from 'cors';

yasui.createServer({
  controllers: [UserController],
  middlewares: [LoggingMiddleware, cors()]
});
```

#### `environment`
**Type:** `string`  
**Défaut:** `process.env.NODE_ENV || 'development'`  
**Description:** Nom de l'environnement pour votre application.

```typescript
yasui.createServer({
  controllers: [UserController],
  environment: 'production'
});
```

#### `port`
**Type:** `number`  
**Défaut:** `3000`  
**Description:** Numéro de port pour le serveur HTTP. Utilisé uniquement avec `createServer()`.

```typescript
yasui.createServer({
  controllers: [UserController],
  port: 8080
});
```

#### `debug`
**Type:** `boolean`  
**Défaut:** `false`  
**Description:** Active le mode débogage avec journalisation supplémentaire et traçage des requêtes.

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true
});
```

#### `injections`
**Type:** `Array<{ token: string, provide: any }>`  
**Défaut:** `[]`  
**Description:** Jetons d'injection personnalisés pour l'injection de dépendances. Voir [Injection de Dépendances](/fr/reference/dependency-injection) pour plus de détails.

```typescript
yasui.createServer({
  controllers: [UserController],
  injections: [
    { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
    { token: 'CONFIG', provide: { apiKey: 'secret' } }
  ]
});
```

#### `swagger`
**Type:** `SwaggerConfig | undefined`  
**Défaut:** `undefined`  
**Description:** Configuration de la documentation Swagger. Voir [Swagger](/fr/reference/swagger) pour plus de détails.

```typescript
yasui.createServer({
  controllers: [UserController],
  swagger: {
    enabled: true,
    path: '/api-docs',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API documentation'
    }
  }
});
```

#### `enableDecoratorValidation`
**Type:** `boolean`  
**Défaut:** `true`  
**Description:** Active la validation des décorateurs au démarrage pour détecter les erreurs de configuration.

```typescript
yasui.createServer({
  controllers: [UserController],
  enableDecoratorValidation: false
});
```

## createServer() vs createApp()

### createServer()

Crée un serveur HTTP et commence à écouter automatiquement :

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController],
  port: 3000,
  debug: true
});

// Le serveur est automatiquement démarré et écoute sur le port 3000
```

**À utiliser quand :**
- Vous voulez démarrer votre serveur immédiatement
- Vous n'avez pas besoin de configuration Express supplémentaire
- Vous construisez une API simple

### createApp()

Renvoie une application Express pour une configuration manuelle :

```typescript
import yasui from 'yasui';

const app = yasui.createApp({
  controllers: [UserController]
});

// Ajouter un middleware Express personnalisé
app.use('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Ajouter des routes personnalisées
app.get('/custom', (req, res) => {
  res.json({ message: 'Custom route' });
});

// Démarrer le serveur manuellement
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**À utiliser quand :**
- Vous avez besoin d'une configuration Express personnalisée
- Vous voulez ajouter des routes ou des middlewares personnalisés
- Vous avez besoin de plus de contrôle sur le démarrage du serveur
- Vous intégrez avec des applications Express existantes

## Exemples de Configuration

### Configuration API de Base

```typescript
import yasui from 'yasui';
import { UserController, AuthController } from './controllers';

yasui.createServer({
  controllers: [UserController, AuthController],
  port: 3000,
  debug: true
});
```

### Configuration Complète

```typescript
import yasui from 'yasui';
import { UserController, AuthController } from './controllers';
import { AuthMiddleware, LoggingMiddleware } from './middleware';

yasui.createServer({
  controllers: [UserController, AuthController],
  middlewares: [LoggingMiddleware, AuthMiddleware],
  port: 3000,
  debug: false,
  environment: 'production',
  enableDecoratorValidation: true,
  injections: [
    { token: 'DATABASE_URL', provide: process.env.DATABASE_URL },
    { token: 'JWT_SECRET', provide: process.env.JWT_SECRET }
  ],
  swagger: {
    enabled: true,
    path: '/api-docs',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Complete API with all features'
    }
  }
});
```

### Intégration Express

```typescript
import yasui from 'yasui';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = yasui.createApp({
  controllers: [UserController],
  middlewares: [LoggingMiddleware]
});

// Ajouter des middlewares Express
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Ajouter des routes personnalisées
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de gestion d'erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Mode Débogage

Activez le mode débogage pour voir des informations détaillées :

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true
});
```

Le mode débogage fournit :
- Journalisation des requêtes/réponses
- Détails sur l'injection de dépendances
- Informations sur l'enregistrement des routes
- Traces de pile d'erreurs