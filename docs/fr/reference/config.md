# Configuration

Référence de configuration complète pour les applications YasuiJS utilisant `yasui.createServer()` et `yasui.createApp()`.

## Aperçu

YasuiJS fournit deux façons principales de créer votre application :

- **`yasui.createServer(config)`** - Crée et démarre un serveur automatiquement
- **`yasui.createApp(config)`** - Retourne un gestionnaire fetch pour une configuration de serveur manuelle

Les deux méthodes acceptent le même objet de configuration avec les options suivantes.

## Options de Configuration

### Options Requises

#### `controllers`
**Type :** `Array<Constructor>`  
**Description :** Tableau de classes de contrôleurs à enregistrer dans votre application.

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController, ProductController]
});
```

### Options Optionnelles

#### `middlewares`
Tableau de middlewares globaux à appliquer à toutes les requêtes. Doivent être des classes de middleware YasuiJS décorées avec `@Middleware()`.
- **Type :** `Array<Constructor>`
- **Défaut :** `[]`
- **Valeur d'exemple :** `[LoggingMiddleware, AuthMiddleware]`
- **Note :** Les middlewares Express (comme `cors()`, `helmet()`) ne sont pas compatibles avec YasuiJS 4.x

#### `globalPipes`
Tableau de pipes globaux à appliquer à tous les paramètres de route. Voir [Pipes](/fr/reference/pipes) pour plus de détails.  
- **Type :** `Array<Constructor<IPipeTransform>>`
- **Défaut :** `[]`
- **Valeur d'exemple :** `[ValidationPipe, TrimPipe]`

#### `environment`
Nom d'environnement pour votre application.
- **Type :** `string`
- **Défaut :** `process.env.NODE_ENV || 'development'`
- **Valeur d'exemple :** `production`

#### `port`
Numéro de port pour le serveur. Utilisé uniquement avec `createServer()`.
- **Type :** `number | string`
- **Défaut :** `3000`

#### `hostname`
Nom d'hôte auquel lier le serveur.
- **Type :** `string | undefined`
- **Défaut :** `'localhost'` en développement, undefined en production

#### `tls`
Configuration TLS/HTTPS. Lorsqu'elle est fournie, le serveur utilise automatiquement HTTPS.
- **Type :** `TLSConfig | undefined`
- **Défaut :** `undefined` (HTTP)
- **Valeur d'exemple :**
```typescript
{
  cert: './path/to/cert.pem',  // ou chaîne PEM
  key: './path/to/key.pem',    // ou chaîne PEM
  passphrase: 'optional',      // phrase de passe optionnelle de la clé
  ca: './path/to/ca.pem'       // certificats CA optionnels
}
```

#### `runtimeOptions`
Options de configuration spécifiques au runtime.
- **Type :** `RuntimeOptions | undefined`
- **Défaut :** `undefined`
- **Valeur d'exemple :**
```typescript
{
  node: {
    http2: true,              // Activer HTTP/2 (défaut : true avec TLS)
    maxHeaderSize: 16384,     // Personnaliser la taille d'en-tête
    ipv6Only: false           // Mode IPv6 uniquement
  }
}
```

#### `debug`
Activer le mode debug avec journalisation supplémentaire et traçage des requêtes.
- **Type :** `boolean`
- **Défaut :** `false`

#### `injections`
Jetons d'injection personnalisés pour l'injection de dépendances. Voir [Injection de Dépendances](/fr/reference/dependency-injection) pour plus de détails.
- **Type :** `Array<{ token: string, provide: any }>`
- **Défaut :** `[]`
- **Valeur d'exemple :**
```typescript
[
  { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
  { token: 'CONFIG', provide: { apiKey: 'secret' } }
]
```

#### `swagger`
Configuration de la documentation Swagger. Voir [Swagger](/fr/reference/swagger) pour plus de détails.
- **Type :** `SwaggerConfig | undefined`
- **Défaut :** `undefined`
- **Valeur d'exemple :**
```typescript
{
  enabled: true,
  path: '/api-docs',
  info: {
    title: 'Mon API',
    version: '1.0.0',
    description: 'Documentation de l\'API'
  }
}
```

#### `enableDecoratorValidation`
Activer la validation des décorateurs au démarrage pour détecter les erreurs de configuration.
- **Type :** `boolean`
- **Défaut :** `true`

## createServer() vs createApp()

### createServer()

Crée un serveur et commence à écouter automatiquement :

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController],
  port: 3000,
  debug: true
});
```

**Utiliser quand :**
- Vous voulez démarrer votre serveur immédiatement
- Vous construisez une API standard
- Vous n'avez pas besoin de configuration de serveur personnalisée

### createApp()

Retourne un gestionnaire fetch compatible avec tout serveur ou plateforme basé sur les standards Web :

```typescript
import yasui from 'yasui';

const app = yasui.createApp({
  controllers: [UserController]
});

// app.fetch est un gestionnaire fetch standard - utilisable avec N'IMPORTE QUEL serveur compatible

// Option 1 : SRVX (multi-runtime)
import { serve } from 'srvx';
serve({
  fetch: app.fetch,
  port: 3000
});

// Option 2 : Deno natif
Deno.serve({ port: 3000 }, app.fetch);

// Option 3 : Bun natif
Bun.serve({
  port: 3000,
  fetch: app.fetch
});

// Option 4 : Cloudflare Workers
export default {
  fetch: app.fetch
};

// Option 5 : Vercel Edge Functions
export const GET = app.fetch;
export const POST = app.fetch;

// Option 6 : Serveur http Node.js
import { createServer } from 'http';
createServer(async (req, res) => {
  const response = await app.fetch(req);
  // Convertir Response en réponse Node.js
});
```

**Utiliser quand :**
- Vous avez besoin d'une configuration de serveur personnalisée
- Vous voulez plus de contrôle sur le démarrage du serveur
- Vous déployez sur des runtimes edge (Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy)
- Vous déployez sur des plateformes serverless
- Vous intégrez avec des fonctionnalités spécifiques à la plateforme

## Exemples de Configuration

### Configuration d'API de Base

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  port: 3000,
  debug: true
});
```

### Configuration Complète avec HTTPS

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  middlewares: [LoggingMiddleware, AuthMiddleware],
  globalPipes: [ValidationPipe, TrimPipe],
  port: 443,
  hostname: 'api.example.com',
  tls: {
    cert: './certs/cert.pem',
    key: './certs/key.pem',
    passphrase: 'optional-passphrase'
  },
  runtimeOptions: {
    node: {
      http2: true,
      maxHeaderSize: 16384
    }
  },
  debug: false,
  environment: 'production',
  enableDecoratorValidation: true,
  injections: [
    { token: 'DATABASE_URL', provide: process.env.DATABASE_URL },
    { token: 'JWT_SECRET', provide: process.env.JWT_SECRET }
  ],
  swagger: {
    generate: true,
    path: '/api-docs',
    info: {
      title: 'Mon API',
      version: '1.0.0',
      description: 'API complète avec toutes les fonctionnalités'
    }
  }
});
```

### Configuration Multi-Runtime

La même configuration fonctionne sur Node.js, Deno et Bun :

```typescript
// Fonctionne sur Node.js, Deno et Bun
yasui.createServer({
  controllers: [UserController],
  port: 3000,
  middlewares: [CorsMiddleware], // Utiliser des middlewares YasuiJS natifs
  debug: true
});
```

### Déploiement Runtime Edge

Pour les runtimes edge, utilisez `createApp()` pour obtenir un gestionnaire fetch standard :

```typescript
const app = yasui.createApp({
  controllers: [UserController],
  middlewares: [CorsMiddleware]
});

// Déployer sur Cloudflare Workers
export default { fetch: app.fetch };

// Déployer sur Vercel Edge
export const GET = app.fetch;
export const POST = app.fetch;

// Déployer sur Deno Deploy
Deno.serve(app.fetch);
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
- Informations d'enregistrement des routes
- Traces de pile d'erreurs