# Rate Limiting

Middleware de limitation de débit prêt pour la production pour les applications YasuiJS. Protège votre API contre les abus en limitant le nombre de requêtes par fenêtre de temps, avec support pour des backends de stockage personnalisés et une génération flexible de clés.

## Installation

::: code-group
```bash [npm]
npm install @yasui/rate-limit
```

```bash [pnpm]
pnpm add @yasui/rate-limit
```

```bash [bun]
bun add @yasui/rate-limit
```

```bash [deno]
deno add jsr:@yasui/rate-limit
```
:::

## Vue d'ensemble

Le package `@yasui/rate-limit` fournit un middleware de limitation de débit flexible avec des fonctionnalités avancées incluant :

- **Limites configurables** - Définissez le maximum de requêtes par fenêtre de temps
- **Stockage en mémoire** - Stockage intégré avec nettoyage automatique
- **Stockage extensible** - Support pour Redis, base de données ou stockage personnalisé
- **Génération de clés personnalisée** - Limitez par IP, clé API, ID utilisateur ou logique personnalisée
- **En-têtes standards** - En-têtes de limitation de débit conformes à la RFC 6585
- **Logique d'exclusion** - Liste blanche de requêtes spécifiques
- **Gestionnaires personnalisés** - Remplacez les réponses 429 par défaut

**Important :** C'est un middleware fonctionnel (non basé sur une classe). Il fonctionne aux côtés des middlewares de classe YasuiJS et doit être enregistré dans le tableau global `middlewares`.

## Démarrage rapide

### Utilisation de base

```typescript
import yasui from 'yasui';
import { rateLimit } from '@yasui/rate-limit';

yasui.createServer({
  middlewares: [
    rateLimit({
      max: 100,       // 100 requêtes
      windowMs: 60000 // par minute
    })
  ],
  controllers: [UserController]
});
```

### Limites de débit par route

```typescript
import { rateLimit } from '@yasui/rate-limit';

const strictLimit = rateLimit({ max: 10, windowMs: 60000 });
const normalLimit = rateLimit({ max: 100, windowMs: 60000 });

@Controller('/api')
export class ApiController {
  @Post('/login', strictLimit)
  login() {
    // Strict : 10 requêtes par minute
  }

  @Get('/data', normalLimit)
  getData() {
    // Normal : 100 requêtes par minute
  }
}
```

## Configuration

La fonction `rateLimit()` accepte un objet de configuration avec les options suivantes :

### `max`

Nombre maximum de requêtes autorisées par fenêtre de temps.

- **Type :** `number`
- **Par défaut :** `100`

### `windowMs`

Durée de la fenêtre de temps en millisecondes.

- **Type :** `number`
- **Par défaut :** `60000` (1 minute)

### `keyGenerator`

Fonction personnalisée pour générer des clés de limitation de débit. Par défaut, utilise l'adresse IP du client.

- **Type :** `(req: YasuiRequest) => string`

```typescript
// Limiter par clé API
rateLimit({
  max: 1000,
  windowMs: 3600000,
  keyGenerator: (req) => {
    return req.rawHeaders.get('x-api-key') ?? 'anonymous';
  }
})
```

### `handler`

Gestionnaire personnalisé pour les réponses de limite de débit dépassée. Suit les modèles YasuiJS : lance `HttpError`, renvoie des données (convertit automatiquement en JSON) ou renvoie `Response` pour des formats personnalisés.

- **Type :** `(req: YasuiRequest, limit: number, remaining: number, resetTime: number) => Response | unknown | Promise<Response | unknown>`

```typescript
import { HttpError } from 'yasui';

// Lancer HttpError (recommandé pour les erreurs JSON)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req, limit) => {
    throw new HttpError(429, 'Trop de requêtes. Veuillez ralentir.');
  }
})

// Renvoyer un objet (convertit automatiquement en JSON avec statut 429)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req, limit, remaining, resetTime) => {
    return {
      error: 'Limite de débit dépassée',
      limit,
      remaining,
      resetTime: Math.ceil(resetTime / 1000)
    };
  }
})

// Renvoyer Response pour format personnalisé (HTML, XML, etc.)
rateLimit({
  max: 100,
  windowMs: 60000,
  handler: (req) => {
    const acceptsHtml = req.rawHeaders.get('accept')?.includes('text/html');

    if (acceptsHtml) {
      return new Response(
        '<h1>Trop de requêtes</h1><p>Veuillez réessayer plus tard.</p>',
        {
          status: 429,
          headers: { 'Content-Type': 'text/html' }
        }
      );
    }

    throw new HttpError(429, 'Limite de débit dépassée');
  }
})
```

### `skip`

Fonction pour ignorer la limitation de débit pour des requêtes spécifiques.

- **Type :** `(req: YasuiRequest) => boolean | Promise<boolean>`

```typescript
// Ignorer les requêtes internes
rateLimit({
  max: 100,
  windowMs: 60000,
  skip: (req) => {
    return req.rawHeaders.get('x-internal-request') === 'true';
  }
})
```

## Comment ça marche

### Suivi des requêtes

Le middleware suit les requêtes en utilisant un algorithme de fenêtre glissante :

1. **Extraire la clé :** Utilise `keyGenerator` pour identifier le demandeur (IP, clé API, etc.)
2. **Incrémenter le compteur :** Stocke l'horodatage de la requête dans le stockage configuré
3. **Vérifier la limite :** Compare le nombre de requêtes avec `max`
4. **Autoriser ou refuser :** Renvoie 429 si dépassé, sinon continue

### En-têtes de réponse

Lorsque `standardHeaders: true`, les réponses incluent :

```http
HTTP/1.1 200 OK
RateLimit-Limit: 100
RateLimit-Remaining: 87
RateLimit-Reset: 1699564800
Content-Type: application/json
```

Lorsque la limite de débit est dépassée :

```http
HTTP/1.1 429 Too Many Requests
RateLimit-Limit: 100
RateLimit-Remaining: 0
RateLimit-Reset: 1699564800
Retry-After: 45
Content-Type: application/json

{"error":"Too Many Requests","message":"Rate limit exceeded. Try again in 45 seconds."}
```

## Bonnes pratiques de sécurité

### 1. Utiliser des limites conservatrices

```typescript
// ✅ RAISONNABLE
rateLimit({ max: 100, windowMs: 60000 })
```

### 2. Protéger les endpoints sensibles

```typescript
const authLimit = rateLimit({ max: 5, windowMs: 15 * 60 * 1000 });

@Controller('/auth')
export class AuthController {
  @Post('/login', authLimit)
  login() {}
}
```

### 3. Valider l'entrée du générateur de clés

**Comportement par défaut :** Utilise `X-Forwarded-For` → `X-Real-IP` → hash de signature de requête. Derrière un reverse proxy, assurez-vous que les en-têtes sont correctement configurés.

**Note :** Le générateur de clés par défaut utilise la signature de requête (User-Agent + Accept-Language) comme solution de secours pour éviter que toutes les requêtes inconnues partagent la même limite de débit.

### 4. Utiliser un stockage persistant en production

```typescript
// ✅ PRODUCTION - Stockage Redis (persistant)
rateLimit({
  max: 100,
  windowMs: 60000,
  store: new RedisStore(redisClient, 60000)
})
```

## Détails techniques

Le middleware de limitation de débit peut être appliqué à tous les niveaux (application, contrôleur, endpoint). Voir [Référence des Middlewares](/fr/reference/middlewares) pour plus de détails sur les niveaux d'utilisation et l'ordre d'exécution des middlewares.

### Optimisations de performance

- Horodatages filtrés efficacement (seules les entrées valides sont conservées)
- Stratégie de nettoyage double : basée sur le temps (toutes les 60s) + basée sur la taille (>10k clés)
- Éviction LRU lorsque la taille maximale est dépassée (supprime 20% des entrées les plus anciennes)
- Incrémentation synchrone pour le stockage en mémoire (pas de surcharge await)
- En-têtes injectés sans cloner le corps de la réponse

**Sécurité mémoire :** Le stockage en mémoire est limité à un maximum de 10 000 clés avec éviction LRU automatique. Pour une production à fort trafic (>10k IPs uniques/heure), utilisez le stockage Redis.

### Conformité

- **RFC 6585 :** Code de statut 429 Too Many Requests
- **Draft RFC :** En-têtes RateLimit-* (standard draft IETF)
- **Standards de l'industrie :** En-tête Retry-After pour la logique de nouvelle tentative du client

## Voir aussi

- [Référence des Middlewares](/fr/reference/middlewares) - Apprenez le système de middleware de YasuiJS
- [Plugin CORS](/fr/plugins/cors) - Partage de ressources cross-origin
- [Gestion des erreurs](/fr/reference/error-handling) - Gérez correctement les erreurs de limite de débit
