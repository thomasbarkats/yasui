# CORS

Middleware CORS (Cross-Origin Resource Sharing) prêt pour la production pour les applications YasuiJS. Gère les requêtes preflight, la validation des origines, les credentials et les fonctionnalités de sécurité modernes.

## Installation

::: code-group
```bash [npm]
npm install @yasui/cors
```

```bash [pnpm]
pnpm add @yasui/cors
```

```bash [bun]
bun add @yasui/cors
```

```bash [deno]
deno add jsr:@yasui/cors
```
:::

## Vue d'ensemble

Le package `@yasui/cors` fournit un middleware CORS conforme aux standards avec des fonctionnalités avancées incluant :

- **Validation des origines** - Correspondance exacte, wildcard ou patterns regex
- **Gestion preflight** - Traitement automatique des requêtes OPTIONS
- **Support credentials** - Gestion des cookies et en-têtes d'autorisation
- **Optimisation cache** - Gestion appropriée de l'en-tête `Vary`
- **Private Network Access** - Support de la spécification CORS-RFC1918
- **Sécurité en premier** - Valeurs par défaut et validation conformes aux standards de l'industrie

**Important :** Il s'agit d'un middleware fonctionnel (non basé sur les classes). Il fonctionne aux côtés des middlewares de classe YasuiJS et doit être enregistré dans le tableau global `middlewares`.

## Démarrage rapide

### Utilisation de base

```typescript
import yasui from 'yasui';
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: ['https://app.example.com', 'https://admin.example.com']
    })
  ],
  controllers: [UserController]
});
```

### Wildcard (Développement uniquement)

```typescript
import { cors } from '@yasui/cors';

yasui.createServer({
  middlewares: [
    cors({
      origins: '*'  // ⚠️ Non recommandé en production
    })
  ],
  controllers: [UserController]
});
```

**Attention :** L'utilisation de `origins: '*'` n'est pas recommandée en production. Spécifiez toujours des origines exactes ou utilisez des patterns regex pour une meilleure sécurité.

## Configuration

La fonction `cors()` accepte un objet de configuration avec les options suivantes :

### `origins` (requis)

Origines autorisées pour les requêtes cross-origin. Peut être un wildcard, un tableau d'origines exactes ou un tableau incluant des patterns regex.

- **Type :** `string[] | RegExp[] | (string | RegExp)[] | '*'`
- **Requis :** Oui
- **Exemples :**

```typescript
// Origines exactes
cors({
  origins: ['https://app.example.com', 'https://admin.example.com']
})

// Wildcard (développement uniquement)
cors({
  origins: '*'
})

// Patterns regex pour sous-domaines dynamiques
cors({
  origins: [
    'https://app.example.com',
    /^https:\/\/.*\.example\.com$/  // Correspond à n'importe quel sous-domaine
  ]
})
```

### `methods`

Méthodes HTTP autorisées dans les requêtes cross-origin.

- **Type :** `string`
- **Par défaut :** `'GET,POST,PUT,DELETE,PATCH,OPTIONS'`
- **Exemple :**

```typescript
cors({
  origins: ['https://app.example.com'],
  methods: 'GET,POST,DELETE'
})
```

### `headers`

En-têtes de requête autorisés dans les requêtes cross-origin.

- **Type :** `string`
- **Par défaut :** `'Content-Type,Authorization'`
- **Exemple :**

```typescript
cors({
  origins: ['https://app.example.com'],
  headers: 'Content-Type,Authorization,X-API-Key'
})
```

### `credentials`

Autoriser les credentials (cookies, en-têtes d'autorisation) dans les requêtes cross-origin.

- **Type :** `boolean`
- **Par défaut :** `false`
- **Important :** Ne peut pas être utilisé avec `origins: '*'` (génèrera une erreur au démarrage)

```typescript
cors({
  origins: ['https://app.example.com'],  // Doit spécifier des origines exactes
  credentials: true
})
```

**Note de sécurité :** Quand `credentials: true`, les navigateurs exigent une origine exacte dans l'en-tête `Access-Control-Allow-Origin`. Le middleware applique cela au démarrage et générera une erreur si vous essayez d'utiliser des wildcards avec credentials.

### `maxAge`

Durée de mise en cache de la réponse preflight en secondes. Détermine combien de temps les navigateurs mettent en cache la réponse preflight.

- **Type :** `number`
- **Par défaut :** `86400` (24 heures)
- **Exemple :**

```typescript
cors({
  origins: ['https://app.example.com'],
  maxAge: 3600  // 1 heure
})
```

### `exposeHeaders`

En-têtes de réponse exposés au client (accessibles via JavaScript).

- **Type :** `string`
- **Par défaut :** `undefined`
- **Exemple :**

```typescript
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: 'X-Total-Count,X-Page-Number'
})
```

**Utilisation :** Par défaut, les navigateurs n'exposent que les en-têtes sûrs (comme `Content-Type`). Utilisez cette option pour exposer des en-têtes personnalisés au JavaScript côté client.

### `allowNullOrigin`

Autoriser les requêtes avec origine `null` (file://, iframes sandboxés, contextes préservant la confidentialité).

- **Type :** `boolean`
- **Par défaut :** `false`
- **Exemple :**

```typescript
cors({
  origins: ['https://app.example.com'],
  allowNullOrigin: true  // Autoriser file:// et contextes sandboxés
})
```

**Cas d'usage :**
- Tests depuis des fichiers HTML locaux (protocole `file://`)
- Iframes sandboxés (`<iframe sandbox>`)
- Fonctionnalités de navigateur préservant la confidentialité

### `allowPrivateNetwork`

Activer le support Private Network Access (CORS-RFC1918) pour les requêtes des réseaux publics vers les réseaux privés/locaux.

- **Type :** `boolean`
- **Par défaut :** `false`
- **Exemple :**

```typescript
cors({
  origins: ['https://app.example.com'],
  allowPrivateNetwork: true
})
```

**Cas d'usage :** Permet aux applications web d'accéder aux ressources du réseau local (ex : `http://192.168.1.100`) lorsque le navigateur le demande via l'en-tête preflight `Access-Control-Request-Private-Network`.

**Note de sécurité :** Le middleware n'envoie `Access-Control-Allow-Private-Network: true` que si la requête preflight inclut explicitement `Access-Control-Request-Private-Network: true`, suivant la spécification CORS-RFC1918.

## Fonctionnement

### Requêtes preflight

Lorsqu'un navigateur effectue une requête cross-origin avec des en-têtes ou méthodes personnalisés, il envoie d'abord une requête preflight `OPTIONS`.

Le middleware CORS intercepte cela et répond avec les en-têtes appropriés.

### Requêtes réelles

Pour les requêtes réelles, le middleware ajoute les en-têtes CORS à la réponse.

### Rejet d'origine

Lorsqu'une origine n'est pas autorisée, le middleware :
1. **Preflight (OPTIONS) :** Retourne `204 No Content` sans en-têtes CORS (standard de l'industrie)
2. **Requêtes réelles :** Passe sans ajouter d'en-têtes CORS

Le navigateur bloque ensuite la réponse, empêchant l'accès JavaScript.

**Pourquoi 204 au lieu de 403 ?** Retourner 204 sans en-têtes CORS est le standard de l'industrie (utilisé par Express, Fastify, etc.) car cela évite de divulguer des informations sur l'existence d'un endpoint.

### Gestion du cache

Le middleware gère automatiquement l'en-tête `Vary: Origin` :

- **Quand `origins: '*'` sans credentials :** Pas d'en-tête `Vary` (réponse identique pour toutes les origines)
- **Quand liste d'origines ou credentials :** Ajoute l'en-tête `Vary: Origin`
- **Quand en-tête `Vary` existant :** Fusionne `Origin` avec les valeurs existantes

Cela garantit que les CDN et navigateurs mettent correctement en cache les réponses CORS.

## Bonnes pratiques de sécurité

### 1. Ne jamais utiliser de wildcards avec credentials

```typescript
// ❌ MAUVAIS - Générera une erreur au démarrage
cors({
  origins: '*',
  credentials: true  // Erreur: impossible d'utiliser credentials avec wildcard
})

// ✅ BON
cors({
  origins: ['https://app.example.com'],
  credentials: true
})
```

### 2. Valider les origines strictement

```typescript
// ❌ RISQUÉ - Trop permissif
cors({
  origins: '*'
})

// ✅ MIEUX - Origines explicites
cors({
  origins: ['https://app.example.com']
})

// ✅ BON - Regex pour wildcards contrôlés
cors({
  origins: [/^https:\/\/[a-z0-9-]+\.example\.com$/]
})
```

### 3. Minimiser les en-têtes exposés

```typescript
// ❌ RISQUÉ - Expose tous les en-têtes
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: '*'  // Non recommandé
})

// ✅ BON - N'exposer que les en-têtes nécessaires
cors({
  origins: ['https://app.example.com'],
  exposeHeaders: 'X-Total-Count,X-Page-Number'
})
```

### 4. Utiliser une configuration basée sur l'environnement

```typescript
// ✅ BON - Configs différentes pour dev/prod
const corsConfig = {
  origins: process.env.NODE_ENV === 'production'
    ? [process.env.FRONTEND_URL]
    : ['http://localhost:3000'],
  credentials: true
};

yasui.createServer({
  middlewares: [cors(corsConfig)],
  controllers: [UserController]
});
```

## Détails techniques

**Important :** Le middleware CORS doit être enregistré dans le tableau global `middlewares` pour intercepter les requêtes OPTIONS :

```typescript
yasui.createServer({
  middlewares: [cors({ origins: [...] })],  // ✅ Enregistré globalement
  controllers: [UserController]
});
```

Si vous obtenez une 404 sur les requêtes preflight, vérifiez que le middleware est enregistré au niveau de l'application, pas au niveau du contrôleur ou de la route.

### Validation au démarrage

Le middleware valide la configuration au démarrage de l'application (pas par requête) :
- ❌ Génère une erreur si `credentials: true` avec `origins: '*'`

### Fusion d'en-têtes

Lors de l'injection des en-têtes CORS dans les réponses :
- Préserve les en-têtes de réponse existants
- Fusionne l'en-tête `Vary` intelligemment (n'écrase pas `Vary: Accept-Encoding`)
- Utilise `Headers.set()` pour les en-têtes CORS (insensible à la casse)

### Optimisations de performance

- Validation d'origine utilise `Array.some()` (s'arrête à la première correspondance)
- Patterns regex compilés une fois à la création du middleware
- Pas de parsing du body pour les requêtes OPTIONS (réponse immédiate)

### Conformité

- **Spécification CORS :** Conformité complète avec la spécification CORS du W3C
- **RFC1918 :** Support Private Network Access
- **Standards de l'industrie :** Suit les patterns Express/Fastify (204 pour preflight rejeté)

## Voir aussi

- [Référence Middlewares](/fr/reference/middlewares) - En savoir plus sur le système de middlewares YasuiJS
- [Configuration](/fr/reference/config) - Configuration au niveau de l'application
- [Gestion des erreurs](/fr/reference/error-handling) - Gérer les erreurs CORS correctement
