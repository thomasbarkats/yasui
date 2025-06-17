# Guide de configuration

## Vue d'ensemble

YasuiJS offre un système de configuration flexible qui permet de personnaliser le comportement de votre application selon l'environnement et les besoins.

## Configuration de base

### Options principales

```typescript
const app = new YasuiApp({
  port: 3000,
  debug: true,
  cors: true,
  middleware: [],
  errorHandler: null
});
```

### Configuration minimale

```typescript
const app = new YasuiApp();
// Utilise les valeurs par défaut : port 3000, debug false, cors false
```

## Options de configuration

### Port

Port sur lequel le serveur écoute.

```typescript
const app = new YasuiApp({
  port: 3000
});

// Ou depuis les variables d'environnement
const app = new YasuiApp({
  port: process.env.PORT || 3000
});
```

### Debug

Active le mode debug avec journalisation détaillée.

```typescript
const app = new YasuiApp({
  debug: true // Active la journalisation détaillée
});

// Ou basé sur l'environnement
const app = new YasuiApp({
  debug: process.env.NODE_ENV === 'development'
});
```

### CORS

Configuration du partage de ressources cross-origin.

```typescript
// CORS simple
const app = new YasuiApp({
  cors: true
});

// CORS avec configuration personnalisée
const app = new YasuiApp({
  cors: {
    origin: ['http://localhost:3000', 'https://myapp.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});
```

### Middleware

Tableau de middlewares globaux.

```typescript
import { loggingMiddleware, authMiddleware } from './middleware';

const app = new YasuiApp({
  middleware: [loggingMiddleware, authMiddleware]
});
```

### Error Handler

Gestionnaire d'erreurs personnalisé.

```typescript
function customErrorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Erreur:', error);
  res.status(500).json({ error: 'Erreur interne du serveur' });
}

const app = new YasuiApp({
  errorHandler: customErrorHandler
});
```

## Configuration par environnement

### Variables d'environnement

```typescript
const app = new YasuiApp({
  port: process.env.PORT || 3000,
  debug: process.env.NODE_ENV === 'development',
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    credentials: process.env.CORS_CREDENTIALS === 'true'
  }
});
```

### Fichiers de configuration

```typescript
// config/default.ts
export const defaultConfig = {
  port: 3000,
  debug: false,
  cors: false
};

// config/development.ts
export const developmentConfig = {
  port: 3000,
  debug: true,
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001']
  }
};

// config/production.ts
export const productionConfig = {
  port: process.env.PORT || 3000,
  debug: false,
  cors: {
    origin: ['https://myapp.com'],
    credentials: true
  }
};

// app.ts
import { defaultConfig } from './config/default';
import { developmentConfig } from './config/development';
import { productionConfig } from './config/production';

const env = process.env.NODE_ENV || 'development';
const config = {
  ...defaultConfig,
  ...(env === 'development' ? developmentConfig : productionConfig)
};

const app = new YasuiApp(config);
```

## Configuration Swagger

### Activation de base

```typescript
const app = new YasuiApp({
  swagger: {
    enabled: true
  }
});
```

### Configuration complète

```typescript
const app = new YasuiApp({
  swagger: {
    enabled: true,
    path: '/api-docs',
    title: 'Mon API',
    version: '1.0.0',
    description: 'Documentation de l\'API',
    contact: {
      name: 'Support',
      email: 'support@myapp.com'
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Serveur de développement' },
      { url: 'https://api.myapp.com', description: 'Serveur de production' }
    ]
  }
});
```

## Configuration de sécurité

### Headers de sécurité

```typescript
import helmet from 'helmet';

const app = new YasuiApp({
  middleware: [
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"]
        }
      }
    })
  ]
});
```

### Rate limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limite chaque IP à 100 requêtes par fenêtre
});

const app = new YasuiApp({
  middleware: [limiter]
});
```

## Configuration de base de données

### Service de configuration

```typescript
@Injectable()
export class ConfigService {
  private config: any;
  
  constructor() {
    this.config = {
      database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
        name: process.env.DATABASE_NAME || 'myapp',
        options: {
          useNewUrlParser: true,
          useUnifiedTopology: true
        }
      },
      redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
      }
    };
  }
  
  get(key: string) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.config);
  }
}
```

### Utilisation dans l'application

```typescript
const app = new YasuiApp({
  port: 3000,
  debug: process.env.NODE_ENV === 'development'
});

// Le service de configuration sera injecté automatiquement
app.registerControllers([UserController]);
```

## Configuration de logging

### Winston logger

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = new YasuiApp({
  middleware: [
    (req, res, next) => {
      logger.info(`${req.method} ${req.path}`);
      next();
    }
  ]
});
```

## Configuration de tests

### Configuration de test

```typescript
// config/test.ts
export const testConfig = {
  port: 0, // Port aléatoire pour les tests
  debug: false,
  cors: false,
  database: {
    url: 'mongodb://localhost:27017/test'
  }
};

// tests/setup.ts
import { YasuiApp } from 'yasui';
import { testConfig } from '../config/test';

export function createTestApp() {
  return new YasuiApp(testConfig);
}
```

## Validation de configuration

### Validation avec Joi

```typescript
import Joi from 'joi';

const configSchema = Joi.object({
  port: Joi.number().port().default(3000),
  debug: Joi.boolean().default(false),
  cors: Joi.alternatives().try(
    Joi.boolean(),
    Joi.object({
      origin: Joi.array().items(Joi.string()),
      credentials: Joi.boolean()
    })
  ).default(false)
});

function validateConfig(config: any) {
  const { error, value } = configSchema.validate(config);
  
  if (error) {
    throw new Error(`Configuration invalide: ${error.message}`);
  }
  
  return value;
}

const config = validateConfig({
  port: process.env.PORT,
  debug: process.env.NODE_ENV === 'development'
});

const app = new YasuiApp(config);
```

## Configuration dynamique

### Rechargement de configuration

```typescript
@Injectable()
export class DynamicConfigService {
  private config: any;
  private watchers: Function[] = [];
  
  constructor() {
    this.loadConfig();
    this.watchConfig();
  }
  
  private loadConfig() {
    this.config = {
      featureFlags: {
        newFeature: process.env.NEW_FEATURE === 'true'
      }
    };
  }
  
  private watchConfig() {
    // Surveiller les changements de variables d'environnement
    setInterval(() => {
      this.loadConfig();
      this.notifyWatchers();
    }, 60000); // Recharger toutes les minutes
  }
  
  get(key: string) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.config);
  }
  
  watch(callback: Function) {
    this.watchers.push(callback);
  }
  
  private notifyWatchers() {
    this.watchers.forEach(callback => callback(this.config));
  }
}
```

## Exemples complets

### Configuration de production

```typescript
// config/production.ts
export const productionConfig = {
  port: process.env.PORT || 3000,
  debug: false,
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://myapp.com'],
    credentials: true
  },
  middleware: [
    helmet(),
    compression(),
    morgan('combined')
  ],
  swagger: {
    enabled: false // Désactiver en production
  },
  errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => {
    // Log l'erreur mais ne pas exposer les détails
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

// app.ts
import { productionConfig } from './config/production';

const app = new YasuiApp(productionConfig);
```

### Configuration de développement

```typescript
// config/development.ts
export const developmentConfig = {
  port: 3000,
  debug: true,
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true
  },
  middleware: [
    morgan('dev')
  ],
  swagger: {
    enabled: true,
    path: '/api-docs',
    title: 'API de développement'
  },
  errorHandler: (error: Error, req: Request, res: Response, next: NextFunction) => {
    // Exposer les détails d'erreur en développement
    console.error('Erreur:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack 
    });
  }
};
```

Cette approche de configuration permet d'adapter facilement votre application à différents environnements et besoins. 