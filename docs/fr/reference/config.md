# Configuration

Référence complète de configuration pour les applications YasuiJS utilisant `yasui.createServer()` et `yasui.createApp()`.

## Vue d'ensemble

YasuiJS propose deux façons principales de créer votre application :

- **`yasui.createServer(config)`** - Crée et démarre un serveur HTTP automatiquement
- **`yasui.createApp(config)`** - Retourne une application Express pour une configuration manuelle

Les deux méthodes acceptent le même objet de configuration avec les options suivantes.

## Options de Configuration

### Options Requises

#### `controllers`
**Type:** `Array<Constructor>`  
**Description:** Tableau des classes de contrôleurs à enregistrer dans votre application.

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController, ProductController]
});
```

### Options Facultatives

#### `middlewares`
Tableau des middlewares globaux à appliquer à toutes les requêtes. Peut être des classes middleware YasuiJS ou des fonctions RequestHandler Express.
- **Type:** `Array<Constructor | RequestHandler>`
- **Défaut:** `[]`
- **Exemple:** `[LoggingMiddleware, cors()]`

#### `globalPipes`
Tableau des pipes globaux à appliquer à tous les paramètres de route. Voir [Pipes](/fr/reference/pipes) pour plus de détails.
- **Type:** `Array<Constructor<IPipeTransform>>`
- **Défaut:** `[]`
- **Exemple:** `[ValidationPipe, TrimPipe]`

#### `environment`
Nom de l'environnement pour votre application.
- **Type:** `string`
- **Défaut:** `process.env.NODE_ENV || 'development'`
- **Exemple:** `production`

#### `port`
Numéro de port pour le serveur HTTP. Utilisé uniquement avec `createServer()`.
- **Type:** `number`
- **Défaut:** `3000`

#### `debug`
Active le mode debug avec des logs supplémentaires et le traçage des requêtes.
- **Type:** `boolean`
- **Défaut:** `false`

#### `injections`
Jetons d'injection personnalisés pour l'injection de dépendances. Voir [Injection de Dépendances](/fr/reference/dependency-injection) pour plus de détails.
- **Type:** `Array<{ token: string, provide: any }>`
- **Défaut:** `[]`
- **Exemple:**
```typescript
[
  { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
  { token: 'CONFIG', provide: { apiKey: 'secret' } }
]
```

#### `swagger`
Configuration de la documentation Swagger. Voir [Swagger](/fr/reference/swagger) pour plus de détails.
- **Type:** `SwaggerConfig | undefined`
- **Défaut:** `undefined`
- **Exemple:**
```typescript
{
  enabled: true,
  path: '/api-docs',
  info: {
    title: 'Mon API',
    version: '1.0.0',
    description: 'Documentation API'
  }
}
```

#### `enableDecoratorValidation`
Active la validation des décorateurs au démarrage pour détecter les erreurs de configuration.
- **Type:** `boolean`
- **Défaut:** `true`

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

// Le serveur démarre automatiquement et écoute sur le port 3000
```

**À utiliser quand :**
- Vous voulez démarrer votre serveur immédiatement
- Vous n'avez pas besoin de configuration Express supplémentaire
- Vous construisez une API simple

### createApp()

Retourne une application Express pour une configuration manuelle :

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
  res.json({ message: 'Route personnalisée' });
});

// Démarrer le serveur manuellement
app.listen(3000, () => {
  console.log('Serveur en cours d\'exécution sur le port 3000');
});
```

**À utiliser quand :**
- Vous avez besoin d'une configuration Express personnalisée
- Vous voulez ajouter des routes ou des middlewares personnalisés
- Vous avez besoin de plus de contrôle sur le démarrage du serveur
- Vous intégrez avec des applications Express existantes

## Exemples de Configuration

### Configuration API Basique

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  port: 3000,
  debug: true
});
```

### Configuration Complète

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  middlewares: [LoggingMiddleware, AuthMiddleware],
  globalPipes: [ValidationPipe, TrimPipe],
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
      title: 'Mon API',
      version: '1.0.0',
      description: 'API complète avec toutes les fonctionnalités'
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

// Middleware de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Quelque chose s\'est mal passé !' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
```

## Mode Debug

Activez le mode debug pour voir des informations détaillées :

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true
});
```

Le mode debug fournit :
- Journalisation des requêtes/réponses
- Détails de l'injection de dépendances
- Informations sur l'enregistrement des routes
- Traces des piles d'erreurs