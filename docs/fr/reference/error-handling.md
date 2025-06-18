# Guide de gestion d'erreurs

## Vue d'ensemble

YasuiJS fournit un système de gestion d'erreurs robuste qui s'intègre avec Express.js et permet une gestion centralisée et cohérente des erreurs dans votre application.

## Types d'erreurs

### HttpError

Erreur avec code de statut HTTP spécifique.

```typescript
import { HttpError } from 'yasui';

// Erreurs courantes
throw new HttpError(400, 'Données invalides');
throw new HttpError(401, 'Non autorisé');
throw new HttpError(403, 'Accès interdit');
throw new HttpError(404, 'Ressource non trouvée');
throw new HttpError(500, 'Erreur interne du serveur');
```

### ValidationError

Erreur de validation de données.

```typescript
import { ValidationError } from 'yasui';

throw new ValidationError('Email invalide');
throw new ValidationError('Le mot de passe doit contenir au moins 8 caractères');
```

### InternalServerError

Erreur interne du serveur.

```typescript
import { InternalServerError } from 'yasui';

throw new InternalServerError('Erreur de base de données');
```

## Gestion d'erreurs dans les contrôleurs

### Try-catch basique

```typescript
@Controller('/api/users')
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/:id')
  async getUser(@Param('id') id: string) {
    try {
      const user = await this.userService.getUserById(id);
      
      if (!user) {
        throw new HttpError(404, 'Utilisateur non trouvé');
      }
      
      return user;
    } catch (error) {
      if (error instanceof HttpError) {
        throw error; // Relancer les erreurs HTTP
      }
      
      // Log l'erreur inattendue
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw new HttpError(500, 'Erreur interne du serveur');
    }
  }
}
```

### Gestion automatique

```typescript
@Controller('/api/users')
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/:id')
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    
    if (!user) {
      throw new HttpError(404, 'Utilisateur non trouvé');
    }
    
    return user; // YasuiJS gère automatiquement les erreurs
  }
}
```

## Middleware de gestion d'erreurs

### Middleware personnalisé

```typescript
import { Request, Response, NextFunction } from 'express';
import { HttpError } from 'yasui';

export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  console.error('Erreur:', error);
  
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode,
      timestamp: new Date().toISOString()
    });
  }
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: error.message,
      statusCode: 400,
      type: 'validation'
    });
  }
  
  // Erreur inattendue
  return res.status(500).json({
    error: 'Erreur interne du serveur',
    statusCode: 500,
    timestamp: new Date().toISOString()
  });
}
```

### Configuration

```typescript
const app = new YasuiApp({
  errorHandler: errorHandler
});
```

## Validation et gestion d'erreurs

### Validation de paramètres

```typescript
@Get('/:id')
async getUser(@Param('id') id: string) {
  // Validation de l'ID
  if (!id || !isValidId(id)) {
    throw new ValidationError('ID invalide');
  }
  
  const user = await this.userService.getUserById(id);
  
  if (!user) {
    throw new HttpError(404, 'Utilisateur non trouvé');
  }
  
  return user;
}
```

### Validation de corps de requête

```typescript
@Post('/')
async createUser(@Body() userData: CreateUserDto) {
  // Validation des données
  if (!userData.name || userData.name.length < 2) {
    throw new ValidationError('Le nom doit contenir au moins 2 caractères');
  }
  
  if (!userData.email || !isValidEmail(userData.email)) {
    throw new ValidationError('Email invalide');
  }
  
  // Vérifier si l'email existe déjà
  const existingUser = await this.userService.getUserByEmail(userData.email);
  if (existingUser) {
    throw new HttpError(409, 'Un utilisateur avec cet email existe déjà');
  }
  
  return await this.userService.createUser(userData);
}
```

## Gestion d'erreurs dans les services

### Service avec gestion d'erreurs

```typescript
@Injectable()
export class UserService {
  
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.databaseService.find('users', { _id: id });
      
      if (!user) {
        throw new HttpError(404, 'Utilisateur non trouvé');
      }
      
      return user;
    } catch (error) {
      this.logger.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
      
      if (error instanceof HttpError) {
        throw error;
      }
      
      // Erreur de base de données
      throw new InternalServerError('Erreur de base de données');
    }
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    try {
      // Validation métier
      if (userData.age && userData.age < 18) {
        throw new ValidationError('L\'utilisateur doit avoir au moins 18 ans');
      }
      
      const user = await this.databaseService.create('users', userData);
      this.logger.info(`Utilisateur créé: ${user.id}`);
      
      return user;
    } catch (error) {
      this.logger.error('Erreur lors de la création de l\'utilisateur:', error);
      
      if (error instanceof ValidationError || error instanceof HttpError) {
        throw error;
      }
      
      throw new InternalServerError('Erreur lors de la création de l\'utilisateur');
    }
  }
}
```

## Erreurs personnalisées

### Création d'erreurs personnalisées

```typescript
export class BusinessError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'BusinessError';
  }
}

export class DatabaseError extends Error {
  constructor(
    public message: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}
```

### Utilisation

```typescript
@Injectable()
export class UserService {
  
  async updateUser(id: string, userData: UpdateUserDto): Promise<User> {
    try {
      const user = await this.databaseService.update('users', { _id: id }, userData);
      
      if (!user) {
        throw new BusinessError('Utilisateur non trouvé', 'USER_NOT_FOUND', 404);
      }
      
      return user;
    } catch (error) {
      if (error instanceof BusinessError) {
        throw error;
      }
      
      throw new DatabaseError('Erreur de base de données', error);
    }
  }
}
```

### Gestion dans le middleware

```typescript
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  if (error instanceof BusinessError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
  }
  
  if (error instanceof DatabaseError) {
    console.error('Erreur de base de données:', error.originalError);
    return res.status(500).json({
      error: 'Erreur de base de données',
      statusCode: 500
    });
  }
  
  // Autres erreurs...
}
```

## Logging des erreurs

### Service de logging

```typescript
@Injectable()
export class LoggerService {
  
  error(message: string, error?: Error, context?: any) {
    const logEntry = {
      level: 'error',
      message,
      timestamp: new Date().toISOString(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined,
      context
    };
    
    console.error(JSON.stringify(logEntry, null, 2));
    
    // En production, envoyer à un service de logging
    if (process.env.NODE_ENV === 'production') {
      this.sendToLoggingService(logEntry);
    }
  }
  
  private sendToLoggingService(logEntry: any) {
    // Implémentation pour envoyer à un service externe
  }
}
```

### Utilisation dans les services

```typescript
@Injectable()
export class UserService {
  
  constructor(private logger: LoggerService) {}

  async getUserById(id: string): Promise<User> {
    try {
      const user = await this.databaseService.find('users', { _id: id });
      
      if (!user) {
        this.logger.error(`Utilisateur non trouvé: ${id}`, undefined, { userId: id });
        throw new HttpError(404, 'Utilisateur non trouvé');
      }
      
      return user;
    } catch (error) {
      this.logger.error(
        `Erreur lors de la récupération de l'utilisateur ${id}`,
        error,
        { userId: id, operation: 'getUserById' }
      );
      
      throw error;
    }
  }
}
```

## Gestion d'erreurs asynchrones

### Wrapper pour les fonctions asynchrones

```typescript
function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

@Controller('/api/users')
export class UserController {
  
  @Get('/:id')
  getUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await this.userService.getUserById(id);
    
    if (!user) {
      throw new HttpError(404, 'Utilisateur non trouvé');
    }
    
    return user;
  });
}
```

## Tests de gestion d'erreurs

### Tests d'erreurs

```typescript
describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;
  
  beforeEach(() => {
    mockUserService = {
      getUserById: jest.fn()
    } as any;
    
    controller = new UserController(mockUserService);
  });
  
  it('should throw 404 when user not found', async () => {
    mockUserService.getUserById.mockResolvedValue(null);
    
    await expect(controller.getUser('nonexistent')).rejects.toThrow(HttpError);
    await expect(controller.getUser('nonexistent')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Utilisateur non trouvé'
    });
  });
  
  it('should throw validation error for invalid ID', async () => {
    await expect(controller.getUser('invalid-id')).rejects.toThrow(ValidationError);
  });
  
  it('should handle database errors', async () => {
    const dbError = new Error('Database connection failed');
    mockUserService.getUserById.mockRejectedValue(dbError);
    
    await expect(controller.getUser('123')).rejects.toThrow(InternalServerError);
  });
});
```

## Bonnes pratiques

### Structure des erreurs

- **Messages clairs** : Utilisez des messages d'erreur compréhensibles
- **Codes d'erreur** : Utilisez des codes d'erreur cohérents
- **Contexte** : Incluez le contexte nécessaire pour le débogage

### Sécurité

- **Ne pas exposer les détails** : En production, ne pas exposer les stack traces
- **Validation stricte** : Validez toutes les entrées utilisateur
- **Logging sécurisé** : Ne pas logger les données sensibles

### Performance

- **Gestion efficace** : Évitez les try-catch inutiles
- **Logging asynchrone** : Utilisez un logging asynchrone pour ne pas bloquer
- **Cache des erreurs** : Mettez en cache les erreurs fréquentes

## Exemples complets

### Application avec gestion d'erreurs complète

```typescript
// Middleware de gestion d'erreurs
export function errorHandler(error: Error, req: Request, res: Response, next: NextFunction) {
  const logger = new LoggerService();
  
  logger.error('Erreur non gérée', error, {
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  if (error instanceof HttpError) {
    return res.status(error.statusCode).json({
      error: error.message,
      statusCode: error.statusCode
    });
  }
  
  if (error instanceof ValidationError) {
    return res.status(400).json({
      error: error.message,
      type: 'validation'
    });
  }
  
  // En production, ne pas exposer les détails
  const isProduction = process.env.NODE_ENV === 'production';
  
  return res.status(500).json({
    error: isProduction ? 'Erreur interne du serveur' : error.message,
    ...(isProduction ? {} : { stack: error.stack })
  });
}

// Application
const app = new YasuiApp({
  errorHandler: errorHandler,
  debug: process.env.NODE_ENV === 'development'
});

// Contrôleur avec gestion d'erreurs
@Controller('/api/users')
export class UserController {
  
  constructor(
    private userService: UserService,
    private logger: LoggerService
  ) {}

  @Get('/:id')
  async getUser(@Param('id') id: string) {
    if (!id || !isValidId(id)) {
      throw new ValidationError('ID invalide');
    }
    
    const user = await this.userService.getUserById(id);
    
    if (!user) {
      throw new HttpError(404, 'Utilisateur non trouvé');
    }
    
    return user;
  }

  @Post('/')
  async createUser(@Body() userData: CreateUserDto) {
    try {
      return await this.userService.createUser(userData);
    } catch (error) {
      this.logger.error('Erreur lors de la création d\'utilisateur', error, { userData });
      throw error; // Relancer pour la gestion centralisée
    }
  }
}
```

Cette approche de gestion d'erreurs assure une expérience utilisateur cohérente et facilite le débogage et la maintenance. 