# Configuration

YasuiJS applications are configured through a configuration object passed to the `Core` class. This guide covers all available configuration options and how to use them effectively.

## Basic Configuration

The configuration object is passed to the `Core` constructor and defines how your application behaves.

```typescript
import { Core } from 'yasui';
import { UserController } from './controllers/user.controller';

const config = {
  controllers: [UserController],
  swagger: {
    generate: true,
    info: {
      title: 'My API',
      version: '1.0.0'
    }
  }
};

const app = new Core(config).createApp();
```

## Configuration Options

### Controllers

Register your controller classes with the application.

```typescript
const config = {
  controllers: [
    UserController,
    ProductController,
    OrderController
  ]
};
```

### Middlewares

Register global middleware that runs on every request.

```typescript
import { LoggingMiddleware, AuthMiddleware } from './middleware';

const config = {
  controllers: [UserController],
  middlewares: [
    LoggingMiddleware,
    AuthMiddleware
  ]
};
```

### Swagger Configuration

Configure automatic Swagger documentation generation.

```typescript
const config = {
  controllers: [UserController],
  swagger: {
    generate: true,
    path: '/api-docs', // Optional: custom path (default: '/api-docs')
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'A sample API built with YasuiJS',
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
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.example.com',
        description: 'Production server'
      }
    ]
  }
};
```

### Debug Mode

Enable debug mode for development.

```typescript
const config = {
  controllers: [UserController],
  debug: true // Enables detailed logging and error messages
};
```

### API Key Authentication

Enable API key authentication for all routes.

```typescript
const config = {
  controllers: [UserController],
  apiKey: 'your-secret-api-key' // All requests must include this key
};
```

### Custom Injections

Register custom dependency injection tokens.

```typescript
const config = {
  controllers: [UserController],
  injections: [
    {
      token: 'DATABASE_URL',
      provide: 'postgresql://localhost:5432/mydb'
    },
    {
      token: 'API_KEY',
      provide: process.env.API_KEY
    },
    {
      token: 'ILogger',
      provide: ConsoleLogger
    }
  ]
};
```

### Decorator Validation

Control decorator validation (enabled by default).

```typescript
const config = {
  controllers: [UserController],
  enableDecoratorValidation: false // Disable decorator validation
};
```

## Environment-Based Configuration

### Development Configuration

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  controllers: [UserController],
  debug: isDevelopment,
  swagger: {
    generate: true,
    info: {
      title: 'My API',
      version: '1.0.0'
    }
  },
  middlewares: isDevelopment ? [LoggingMiddleware] : []
};
```

### Production Configuration

```typescript
const isProduction = process.env.NODE_ENV === 'production';

const config = {
  controllers: [UserController],
  debug: false,
  apiKey: process.env.API_KEY,
  swagger: {
    generate: false // Disable Swagger in production
  },
  middlewares: [
    RateLimitMiddleware,
    SecurityMiddleware
  ]
};
```

## Configuration Factories

### Environment-Specific Configuration

```typescript
function createConfig(environment: string) {
  const baseConfig = {
    controllers: [UserController, ProductController],
    enableDecoratorValidation: true
  };

  switch (environment) {
    case 'development':
      return {
        ...baseConfig,
        debug: true,
        swagger: {
          generate: true,
          info: {
            title: 'My API (Dev)',
            version: '1.0.0'
          }
        },
        middlewares: [LoggingMiddleware]
      };

    case 'staging':
      return {
        ...baseConfig,
        debug: false,
        swagger: {
          generate: true,
          info: {
            title: 'My API (Staging)',
            version: '1.0.0'
          }
        },
        middlewares: [LoggingMiddleware, AuthMiddleware]
      };

    case 'production':
      return {
        ...baseConfig,
        debug: false,
        apiKey: process.env.API_KEY,
        swagger: {
          generate: false
        },
        middlewares: [
          RateLimitMiddleware,
          SecurityMiddleware,
          AuthMiddleware
        ]
      };

    default:
      throw new Error(`Unknown environment: ${environment}`);
  }
}

const config = createConfig(process.env.NODE_ENV || 'development');
const app = new Core(config).createApp();
```

### Configuration with Validation

```typescript
interface AppConfig {
  controllers: any[];
  middlewares?: any[];
  swagger?: {
    generate: boolean;
    info: {
      title: string;
      version: string;
      description?: string;
    };
  };
  debug?: boolean;
  apiKey?: string;
  injections?: Array<{
    token: string;
    provide: any;
  }>;
}

function validateConfig(config: AppConfig): AppConfig {
  if (!config.controllers || config.controllers.length === 0) {
    throw new Error('At least one controller must be provided');
  }

  if (config.apiKey && typeof config.apiKey !== 'string') {
    throw new Error('API key must be a string');
  }

  if (config.swagger?.generate && !config.swagger.info) {
    throw new Error('Swagger info is required when Swagger is enabled');
  }

  return config;
}

const config = validateConfig({
  controllers: [UserController],
  swagger: {
    generate: true,
    info: {
      title: 'My API',
      version: '1.0.0'
    }
  }
});
```

## Advanced Configuration Patterns

### Modular Configuration

```typescript
// config/database.ts
export const databaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'mydb',
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || ''
};

// config/swagger.ts
export const swaggerConfig = {
  generate: process.env.NODE_ENV !== 'production',
  path: '/api-docs',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'A sample API built with YasuiJS'
  }
};

// config/middleware.ts
export const getMiddlewareConfig = (environment: string) => {
  const baseMiddleware = [LoggingMiddleware];
  
  if (environment === 'production') {
    return [...baseMiddleware, RateLimitMiddleware, SecurityMiddleware];
  }
  
  return baseMiddleware;
};

// config/index.ts
import { databaseConfig } from './database';
import { swaggerConfig } from './swagger';
import { getMiddlewareConfig } from './middleware';

export function createAppConfig() {
  const environment = process.env.NODE_ENV || 'development';
  
  return {
    controllers: [UserController, ProductController],
    middlewares: getMiddlewareConfig(environment),
    swagger: swaggerConfig,
    debug: environment === 'development',
    apiKey: process.env.API_KEY,
    injections: [
      {
        token: 'DATABASE_CONFIG',
        provide: databaseConfig
      }
    ]
  };
}
```

### Configuration with Secrets Management

```typescript
import { SecretsManager } from 'aws-sdk';

async function loadSecrets() {
  if (process.env.NODE_ENV === 'production') {
    const secretsManager = new SecretsManager();
    const secret = await secretsManager.getSecretValue({
      SecretId: 'my-api-secrets'
    }).promise();
    
    return JSON.parse(secret.SecretString || '{}');
  }
  
  return {
    apiKey: process.env.API_KEY,
    databaseUrl: process.env.DATABASE_URL
  };
}

async function createConfig() {
  const secrets = await loadSecrets();
  
  return {
    controllers: [UserController],
    apiKey: secrets.apiKey,
    injections: [
      {
        token: 'DATABASE_URL',
        provide: secrets.databaseUrl
      }
    ]
  };
}

// Usage
createConfig().then(config => {
  const app = new Core(config).createApp();
  app.listen(3000);
});
```

## Configuration Best Practices

### 1. Use Environment Variables

```typescript
const config = {
  controllers: [UserController],
  debug: process.env.NODE_ENV === 'development',
  apiKey: process.env.API_KEY,
  swagger: {
    generate: process.env.ENABLE_SWAGGER === 'true',
    info: {
      title: process.env.API_TITLE || 'My API',
      version: process.env.API_VERSION || '1.0.0'
    }
  }
};
```

### 2. Validate Configuration

```typescript
function validateConfig(config: any) {
  const required = ['controllers'];
  
  for (const field of required) {
    if (!config[field]) {
      throw new Error(`Missing required configuration: ${field}`);
    }
  }
  
  if (config.controllers.length === 0) {
    throw new Error('At least one controller must be provided');
  }
  
  return config;
}

const config = validateConfig({
  controllers: [UserController]
});
```

### 3. Separate Concerns

```typescript
// Don't mix configuration with business logic
const config = {
  controllers: [UserController],
  // Configuration only
};

// Business logic in controllers and services
@Controller('/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

### 4. Use TypeScript for Configuration

```typescript
interface AppConfig {
  controllers: any[];
  middlewares?: any[];
  swagger?: SwaggerConfig;
  debug?: boolean;
  apiKey?: string;
  injections?: InjectionConfig[];
}

interface SwaggerConfig {
  generate: boolean;
  info: {
    title: string;
    version: string;
    description?: string;
  };
}

interface InjectionConfig {
  token: string;
  provide: any;
}

const config: AppConfig = {
  controllers: [UserController],
  swagger: {
    generate: true,
    info: {
      title: 'My API',
      version: '1.0.0'
    }
  }
};
```

### 5. Configuration Testing

```typescript
describe('App Configuration', () => {
  it('should have valid configuration', () => {
    const config = createConfig('test');
    
    expect(config.controllers).toBeDefined();
    expect(config.controllers.length).toBeGreaterThan(0);
    expect(config.debug).toBe(false);
  });
  
  it('should enable debug mode in development', () => {
    const config = createConfig('development');
    expect(config.debug).toBe(true);
  });
  
  it('should disable Swagger in production', () => {
    const config = createConfig('production');
    expect(config.swagger?.generate).toBe(false);
  });
});
```

## Configuration Examples

### Minimal Configuration

```typescript
const config = {
  controllers: [UserController]
};

const app = new Core(config).createApp();
```

### Full-Featured Configuration

```typescript
const config = {
  controllers: [UserController, ProductController, OrderController],
  middlewares: [LoggingMiddleware, AuthMiddleware, RateLimitMiddleware],
  swagger: {
    generate: true,
    path: '/docs',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description: 'Complete e-commerce API with user management, products, and orders',
      contact: {
        name: 'API Team',
        email: 'api@company.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development'
      },
      {
        url: 'https://api.company.com',
        description: 'Production'
      }
    ]
  },
  debug: process.env.NODE_ENV === 'development',
  apiKey: process.env.API_KEY,
  enableDecoratorValidation: true,
  injections: [
    {
      token: 'DATABASE_URL',
      provide: process.env.DATABASE_URL
    },
    {
      token: 'REDIS_URL',
      provide: process.env.REDIS_URL
    },
    {
      token: 'ILogger',
      provide: process.env.NODE_ENV === 'production' ? ProductionLogger : ConsoleLogger
    }
  ]
};
```

## Next Steps

Now that you understand configuration, you can:

- [Learn about Error Handling](/guide/error-handling)
- [Explore Advanced Patterns](/guide/advanced-patterns)
- [Master Production Deployment](/guide/production)
- [Build Scalable APIs](/guide/scaling) 