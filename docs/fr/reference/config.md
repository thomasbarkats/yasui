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
- **Défaut :** `undefined`
- **Valeur d'exemple :** `production`

#### `port`
Numéro de port pour le serveur. Utilisé uniquement avec `createServer()`.
- **Type :** `number | string`
- **Défaut :** `3000`

#### `hostname`
Nom d'hôte auquel lier le serveur.
- **Type :** `string | undefined`
- **Défaut :** `'localhost'` en développement, undefined en production

#### `maxBodySize`
Taille maximale du corps de la requête en octets. Les requêtes dépassant cette limite seront rejetées avec 413 Payload Too Large.
- **Type :** `number`
- **Défaut :** `10485760` (10MB)
- **Note :** Il s'agit d'une vérification au niveau de l'application qui fonctionne sur tous les runtimes (Node.js, Deno, Bun)

#### `maxHeaderSize`
Taille totale maximale des en-têtes en octets. Les requêtes dépassant cette limite seront rejetées avec 413 Payload Too Large.
- **Type :** `number`
- **Défaut :** `16384` (16KB)
- **Note :** Il s'agit d'une vérification au niveau de l'application qui fonctionne sur tous les runtimes.

#### `tls`
Configuration TLS/HTTPS. Lorsqu'elle est fournie, le serveur utilise automatiquement HTTPS. Les types sont extraits de **srvx**.
- **Type :** `TLSConfig | undefined`
- **Défaut :** `undefined` (HTTP)
- **Valeur d'exemple :**
```typescript
{
  cert: './path/to/cert.pem',  // ou chaîne PEM
  key: './path/to/key.pem',    // ou chaîne PEM
  passphrase: 'optional'       // phrase de passe optionnelle de la clé
}
```

#### `runtimeOptions`
Options de configuration du serveur spécifiques au runtime. Elles sont transmises directement au serveur sous-jacent ([srvx](https://srvx.h3.dev)), qui les transmet ensuite au runtime respectif. Les types sont extraits de `ServerOptions` de srvx pour la sécurité des types.
- **Type :** `RuntimeOptions | undefined`
- **Défaut :** `undefined`
- **Runtimes supportés :** `node`, `bun`, `deno`, `serviceWorker`

**Options disponibles par runtime :**

- **`node`** : Accepte toutes les [Node.js HTTP ServerOptions](https://nodejs.org/api/http.html#httpcreateserveroptions-requestlistener), [HTTPS ServerOptions](https://nodejs.org/api/https.html#httpscreateserveroptions-requestlistener), [HTTP/2 ServerOptions](https://nodejs.org/api/http2.html#http2createsecureserveroptions-onrequesthandler), et [ListenOptions](https://nodejs.org/api/net.html#serverlistenoptions-callback), plus :
  - `http2?: boolean` - Activer HTTP/2 (défaut : true avec TLS)

- **`bun`** : Accepte toutes les [Bun.Serve.Options](https://bun.sh/docs/api/http) (sauf `fetch`)

- **`deno`** : Accepte toutes les [Deno.ServeOptions](https://docs.deno.com/api/deno/~/Deno.ServeOptions)

- **`serviceWorker`** : Accepte la configuration du service worker (voir [docs srvx](https://srvx.h3.dev/guide/options))

**Exemple :**
```typescript
yasui.createServer({
  controllers: [UserController],
  runtimeOptions: {
    node: {
      http2: true,
      maxHeadersize: 16384,
      ipv6Only: false
    }
  }
});
```

**Note :** Pour des limites de taille d'en-têtes/corps cohérentes sur tous les runtimes, utilisez les options de niveau racine `maxHeaderSize` et `maxBodySize`. Les options spécifiques au runtime fournissent une défense en profondeur supplémentaire lorsque cela est pris en charge.

#### `debug`
Activer le mode debug avec journalisation supplémentaire et traçage des requêtes.
- **Type :** `boolean`
- **Défaut :** `false`

#### `injections`
Jetons d'injection personnalisés pour l'injection de dépendances. Voir [Injection de Dépendances](/fr/reference/dependency-injection) pour plus de détails.
- **Type :** `Array<Injection>`
- **Défaut :** `[]`

Où `Injection` est :
```typescript
{ token: string; provide: any } | // Valeur directe
{ token: string; factory: () => Promise<any>; deferred?: boolean } // Factory
```

- **Valeurs d'exemple :**
```typescript
[
  // Valeur directe
  { token: 'API_KEY', provide: 'value' },

  // Factory asynchrone (construite avant le démarrage du serveur)
  {
    token: 'DATABASE',
    factory: async () => {
      const db = new Database();
      await db.connect();
      return db;
    }
  },
  // Factory non bloquante (le serveur démarre sans elle et accepte les erreurs)
  {
    token: 'ANALYTICS',
    deferred: true,
    factory: async () => {
      const analytics = new AnalyticsClient();
      await analytics.connect();
      return analytics;
    },
  }
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

#### `strictValidation`
Activer la validation stricte pour la conversion de types et l'analyse JSON. Lorsqu'activé, lance `HttpError(400)` au lieu de retourner des valeurs invalides (NaN, Invalid Date, null) ou un body indéfini.
- **Type :** `boolean`
- **Défaut :** `false`
- **Voir :** [Mode de validation stricte](/reference/controllers#mode-de-validation-stricte) pour le comportement détaillé et les exemples

#### `requestTimeout`
Durée maximale de requête en millisecondes. Les requêtes dépassant cette durée seront terminées avec 408 Request Timeout.
- **Type :** `number`
- **Défaut :** `30000` (30 secondes)
- **Note :** Empêche les requêtes de longue durée d'épuiser les ressources du serveur. Définir à `0` pour désactiver le timeout.

#### `compression`
Active la compression gzip automatique des réponses basée sur l'en-tête `Accept-Encoding` du client.
- **Type :** `boolean`
- **Défaut :** `false`
- **Comportement :**
  - Compresse uniquement lorsque le client envoie l'en-tête `Accept-Encoding: gzip`
  - Compresse uniquement les types de contenu textuels (JSON, HTML, CSS, JavaScript, XML)
  - Ignore la compression pour les formats binaires (images, vidéos, archives)
  - Les navigateurs et clients HTTP (curl, Postman, fetch) décompressent automatiquement les réponses
- **Exemple :**
```typescript
yasui.createServer({
  controllers: [UserController],
  compression: true  // Activer la compression gzip
});
```
- **Note :** Nécessite l'API `CompressionStream` des Web Standards (Node.js 18+, Deno, Bun). Si indisponible, la compression sera silencieusement ignorée avec un avertissement au démarrage. Fournit une réduction de bande passante de 70%+ pour les réponses JSON/texte avec une surcharge CPU minimale lorsque disponible.

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

## Environment

YasuiJS fournit un accès aux variables d'environnement qui est indépendant du runtime. Utilisez-le au lieu de `process.env` pour garantir la compatibilité sur Node.js, Deno et Bun.

- `getEnv(name: string, fallback?: string): string` - Lire une variable d'environnement avec une valeur de repli optionnelle

```typescript
import { getEnv, Injectable } from 'yasui';

@Injectable()
export class DatabaseService {
  private readonly dbUrl = getEnv('DATABASE_URL', 'localhost');
  private readonly port = getEnv('DB_PORT', '5432');

  connect() {
    console.log(`Connexion à ${this.dbUrl}:${this.port}`);
  }
}
```
