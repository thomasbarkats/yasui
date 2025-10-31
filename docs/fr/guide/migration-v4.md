# Guide de Migration : v3.x vers v4.x

Ce guide vous aide à migrer de YasuiJS 3.x (basé sur Express) vers YasuiJS 4.x (Web Standards avec [SRVX](https://srvx.h3.dev)).

## Aperçu des Changements

YasuiJS 4.x représente un changement architectural majeur :

- **Suppression de la dépendance Express** - Utilise maintenant les Web Standards
- **createServer()** - Utilise [srvx](https://srvx.h3.dev) pour Node.js, Deno et Bun
- **createApp()** - Retourne un gestionnaire fetch standard pour toute plateforme Web Standards
- **Prêt pour l'Edge** - Déployez sur Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy (via createApp)
- **Compatible serverless** - Fonctionne avec AWS Lambda, Vercel Functions, Netlify Functions (via createApp)
- **Changements cassants** - Les middlewares Express ne sont plus compatibles
- **Nouvelles fonctionnalités** - Support TLS/HTTPS, HTTP/2 sur Node.js

## Changements Cassants

### 1. Middlewares Express Non Compatibles

**Avant (v3.x) :**
```typescript
import cors from 'cors';
import helmet from 'helmet';

yasui.createServer({
  middlewares: [cors(), helmet()]
});
```

**Après (v4.x) :**
Les middlewares Express ne sont **pas compatibles**. Vous devez soit :
1. Trouver des alternatives compatibles Web Standards
2. Écrire des middlewares YasuiJS natifs

```typescript
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  }
}

yasui.createServer({
  middlewares: [CorsMiddleware]
});
```

### 2. Objet Response Plus Supporté

`@Res()` est **supprimé** - plus supporté.

**Avant (v3.x) :**
```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request, @Res() res: Response) {
    if (!req.headers.authorization) {
      // Utiliser @Res() était possible mais non recommandé
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
  }
}
```

**Après (v4.x) :**
```typescript
@Middleware()
export class AuthMiddleware {
  use(@Req() req: Request) {
    if (!req.headers.get('authorization')) {
      // Lancez des erreurs ou retournez des objets Response
      throw new HttpError(401, 'Unauthorized');
    }
    // Continuera vers le middleware suivant ou le contrôleur si vous ne retournez rien/void
  }
}
```

### 3. Changements de l'Objet Request

`@Req()` fournit un objet Request standard web, plutôt qu'Express ; seules certaines propriétés restent compatibles.

**Propriétés compatibles Express** (toujours disponibles) :
- `req.path` - Chemin sans chaîne de requête
- `req.hostname` - Hôte sans port
- `req.protocol` - "http" ou "https"
- `req.ip` - Adresse IP du client
- `req.query` - Objet de requête analysé
- `req.cookies` - Objet de cookies analysé
- `req.body` - Corps de requête analysé
- `req.headers` - Retourne un objet simple pour l'accès aux propriétés

**Après (v4.x) :**
```typescript
@Get('/users')
getUsers(@Req() req: Request) {
  // En-têtes via .get() sur l'objet Headers natif
  const auth = req.headers.get('authorization');

  // Les propriétés compatibles Express fonctionnent toujours
  const auth = req.headers.authorization;
  const page = req.query.page;
  const path = req.path;
}
```

### 4. Changements de Gestion de Réponse Personnalisée

**Avant (v3.x) :**
```typescript
@Get('/custom')
customResponse(@Res() res: Response) {
  res.status(418).json({ message: "I'm a teapot" });
}
```

**Après (v4.x) :**
```typescript
@Get('/custom')
customResponse() {
  // Option 1 : Retourner une Response Web Standards
  return new Response(JSON.stringify({ message: "I'm a teapot" }), {
    status: 418,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### 5. Type de Retour de createApp()

**Avant (v3.x) :**
```typescript
import express from 'express';

const app = yasui.createApp({ controllers: [UserController] });
// app est une Application Express

app.use(express.json());
app.listen(3000);
```

**Après (v4.x) :**
```typescript
import { serve } from 'srvx';

const app = yasui.createApp({ controllers: [UserController] });
// app est FetchHandler { fetch: Function }

serve({
  fetch: app.fetch,
  port: 3000
});
```

### 6. Changements de Configuration

**Avant (v3.x) :**
```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [cors(), helmet()],
  protocol: 'http',
  port: 3000
});
```

**Après (v4.x) :**
```typescript
yasui.createServer({
  controllers: [UserController],
  middlewares: [CorsMiddleware],  // Seulement les middlewares YasuiJS
  port: 3000,
  tls: {  // Nouveau : support TLS/HTTPS
    cert: './cert.pem',
    key: './key.pem'
  },
  runtimeOptions: {  // Nouveau : options spécifiques au runtime
    node: {
      http2: true
    }
  }
});
```

**Nouvelles options :**
- `tls` - Configuration TLS/HTTPS
- `hostname` - Nom d'hôte du serveur
- `runtimeOptions` - Configuration spécifique au runtime

**Déprécié :**
- `protocol` - Auto-déterminé par la configuration `tls`

## Étapes de Migration

### Étape 1 : Mettre à Jour les Dépendances

```bash
npm install yasui@latest
# ou
pnpm update yasui
```

### Étape 2 : Supprimer les Middlewares Express

Identifiez tous les middlewares Express dans votre code :

```typescript
// SUPPRIMEZ ceci
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

yasui.createServer({
  middlewares: [cors(), helmet(), morgan('dev')]  // ❌ Ne fonctionne plus
});
```

### Étape 3 : Remplacer par des Middlewares Natifs

Écrivez des middlewares YasuiJS pour chaque fonctionnalité :

```typescript
// Créer un middleware CORS natif
@Middleware()
export class CorsMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Next() next: NextFunction) {
    const response = await next();
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    return new Response(response.body, {
      status: response.status,
      headers,
    });
  }
}

// Créer un middleware de logging natif
@Middleware()
export class LoggingMiddleware implements IMiddleware {
  async use(@Req() req: Request, @Logger() logger: LoggerService, @Next() next: NextFunction) {
    logger.log(`${req.method} ${req.path}`);
    return await next();
  }
}

yasui.createServer({
  middlewares: [CorsMiddleware, LoggingMiddleware]  // ✅ Fonctionne
});
```

### Étape 4 : Mettre à Jour les Signatures de Middleware

Supprimez l'utilisation de `@Res()` de tous les middlewares : lancez new HttpError pour le statut d'erreur, ou retournez une valeur.

Rappel : Les middlewares fonctionnent comme les méthodes de contrôleur. Vous n'avez pas besoin d'appeler `next()` sauf si vous voulez modifier la réponse.

### Étape 6 : Mettre à Jour la Gestion Manuelle des Réponses

Remplacez les méthodes de réponse Express par les Web Standards :

**Avant :**
```typescript
@Get('/file')
downloadFile(@Res() res: Response) {
  res.sendFile('/path/to/file.pdf');
}

@Get('/redirect')
redirect(@Res() res: Response) {
  res.redirect('/new-location');
}
```

**Après :**
```typescript
@Get('/file')
async downloadFile() {
  const file = await Deno.readFile('/path/to/file.pdf'); // ou fs.readFile
  return new Response(file, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="file.pdf"'
    }
  });
}

@Get('/redirect')
redirect() {
  return new Response(null, {
    status: 302,
    headers: { 'Location': '/new-location' }
  });
}
```

### Étape 7 : Mettre à Jour l'Utilisation de createApp()

Si vous utilisiez `createApp()` pour une configuration de serveur personnalisée :

**Avant :**
```typescript
const app = yasui.createApp({ controllers: [UserController] });

app.use(express.static('public'));
app.listen(3000);
```

**Après :**
```typescript
import { serve } from 'srvx';

const app = yasui.createApp({ controllers: [UserController] });

serve({
  fetch: app.fetch,
  port: 3000,
  static: {  // service de fichiers statiques srvx
    '/': './public'
  }
});
```

### Étape 8 : Tester Votre Application

1. Démarrez votre serveur
2. Testez tous les endpoints
3. Vérifiez le comportement des middlewares
4. Vérifiez la gestion des erreurs
5. Testez avec différents runtimes (Node.js, Deno, Bun)

## Nouvelles Fonctionnalités en v4.x

### Support TLS/HTTPS

```typescript
yasui.createServer({
  controllers: [UserController],
  port: 443,
  tls: {
    cert: './certs/cert.pem',
    key: './certs/key.pem',
    passphrase: 'optionnel'
  }
});
```

### Support HTTP/2 (Node.js)

```typescript
yasui.createServer({
  controllers: [UserController],
  tls: {
    cert: './cert.pem',
    key: './key.pem'
  },
  runtimeOptions: {
    node: {
      http2: true  // Activé par défaut avec TLS
    }
  }
});
```

### Multi-Runtime et Déploiement Edge

Le même code fonctionne sur tous les runtimes et plateformes :

```typescript
// Runtimes traditionnels
// Fonctionne sur Node.js, Deno et Bun
yasui.createServer({
  controllers: [UserController],
  port: 3000
});

// Runtimes Edge - utilisez createApp()
const app = yasui.createApp({
  controllers: [UserController]
});

// Cloudflare Workers
export default {
  fetch: app.fetch
};

// Vercel Edge Functions
export const GET = app.fetch;
export const POST = app.fetch;

// Deno Deploy
Deno.serve(app.fetch);

// Netlify Edge Functions
export default app.fetch;
```

### Déployez Partout

Puisque YasuiJS retourne un gestionnaire fetch standard, vous pouvez déployer sur :
- **Serveurs traditionnels** : Node.js, Deno, Bun
- **Runtimes Edge** : Cloudflare Workers, Vercel Edge, Netlify Edge, Deno Deploy
- **Serverless** : AWS Lambda (avec adaptateurs), Vercel Functions, Netlify Functions
- **Toute plateforme** qui supporte les gestionnaires fetch Web Standards

## Obtenir de l'Aide

Si vous rencontrez des problèmes pendant la migration :

1. Consultez la [documentation](/fr/reference/config)
2. Examinez les [exemples](https://github.com/thomasbarkats/yasui/tree/main/src/example)
3. Ouvrez un ticket sur [GitHub](https://github.com/thomasbarkats/yasui/issues)