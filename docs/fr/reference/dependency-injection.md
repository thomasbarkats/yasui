# Guide d'injection de dépendances

## Vue d'ensemble

L'injection de dépendances (DI) dans YasuiJS permet de gérer automatiquement les dépendances entre les classes, rendant votre code plus modulaire, testable et maintenable.

## Concepts de base

### Qu'est-ce que l'injection de dépendances ?

L'injection de dépendances est un pattern qui fournit des dépendances à une classe sans qu'elle ait besoin de les créer elle-même. YasuiJS utilise un conteneur DI qui gère le cycle de vie des services.

### Avantages

- **Découplage** : Les classes ne dépendent pas directement de leurs dépendances
- **Testabilité** : Facile de mocker les dépendances pour les tests
- **Réutilisabilité** : Les services peuvent être partagés entre plusieurs contrôleurs
- **Maintenabilité** : Changements de dépendances sans modifier le code client

## Décorateur @Injectable

### Utilisation de base

```typescript
@Injectable()
export class UserService {
  async getUsers() {
    return await this.database.find('users');
  }
}
```

### Options de configuration

```typescript
@Injectable({ scope: 'singleton' })
export class SingletonService {
  // Une seule instance pour toute l'application
}

@Injectable({ scope: 'request' })
export class RequestScopedService {
  // Nouvelle instance pour chaque requête
}

@Injectable({ scope: 'transient' })
export class TransientService {
  // Nouvelle instance à chaque injection
}
```

## Scopes de service

### Singleton (par défaut)

Une seule instance est créée et partagée dans toute l'application.

```typescript
@Injectable()
export class DatabaseService {
  private connection: any;
  
  async connect() {
    if (!this.connection) {
      this.connection = await createConnection();
    }
    return this.connection;
  }
}
```

### Request

Une nouvelle instance est créée pour chaque requête HTTP.

```typescript
@Injectable({ scope: 'request' })
export class RequestContextService {
  private requestId: string;
  
  constructor() {
    this.requestId = generateRequestId();
  }
  
  getRequestId() {
    return this.requestId;
  }
}
```

### Transient

Une nouvelle instance est créée à chaque injection.

```typescript
@Injectable({ scope: 'transient' })
export class LoggerService {
  private id: string;
  
  constructor() {
    this.id = Math.random().toString(36);
  }
  
  log(message: string) {
    console.log(`[${this.id}] ${message}`);
  }
}
```

## Injection dans les constructeurs

### Injection simple

```typescript
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

### Injection multiple

```typescript
@Controller('/api/users')
export class UserController {
  constructor(
    private userService: UserService,
    private emailService: EmailService,
    private logger: LoggerService
  ) {}
  
  @Post('/')
  async createUser(@Body() userData: CreateUserDto) {
    const user = await this.userService.createUser(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    this.logger.log(`Utilisateur créé: ${user.id}`);
    return user;
  }
}
```

## Services avec dépendances

### Service de base de données

```typescript
@Injectable()
export class DatabaseService {
  private connection: any;
  
  async connect() {
    if (!this.connection) {
      this.connection = await createConnection();
    }
    return this.connection;
  }
  
  async find(collection: string, query: any) {
    const db = await this.connect();
    return await db.collection(collection).find(query).toArray();
  }
  
  async create(collection: string, data: any) {
    const db = await this.connect();
    return await db.collection(collection).insertOne(data);
  }
}
```

### Service utilisateur

```typescript
@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}
  
  async getUsers() {
    return await this.databaseService.find('users', {});
  }
  
  async createUser(userData: CreateUserDto) {
    return await this.databaseService.create('users', userData);
  }
}
```

### Service d'email

```typescript
@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}
  
  async sendEmail(to: string, subject: string, body: string) {
    const smtpConfig = this.configService.get('smtp');
    // Logique d'envoi d'email
  }
  
  async sendWelcomeEmail(email: string) {
    await this.sendEmail(email, 'Bienvenue !', 'Bienvenue dans notre application');
  }
}
```

## Configuration et services

### Service de configuration

```typescript
@Injectable()
export class ConfigService {
  private config: any;
  
  constructor() {
    this.config = {
      database: {
        url: process.env.DATABASE_URL || 'mongodb://localhost:27017',
        name: process.env.DATABASE_NAME || 'myapp'
      },
      smtp: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };
  }
  
  get(key: string) {
    return key.split('.').reduce((obj, k) => obj?.[k], this.config);
  }
}
```

### Utilisation dans les services

```typescript
@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}
  
  async connect() {
    const dbConfig = this.configService.get('database');
    return await createConnection(dbConfig);
  }
}
```

## Patterns avancés

### Factory pattern

```typescript
@Injectable()
export class ServiceFactory {
  createUserService(): UserService {
    return new UserService();
  }
  
  createEmailService(): EmailService {
    return new EmailService();
  }
}

@Controller('/api/users')
export class UserController {
  constructor(private serviceFactory: ServiceFactory) {}
  
  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    const userService = this.serviceFactory.createUserService();
    const emailService = this.serviceFactory.createEmailService();
    
    // Utilisation des services
  }
}
```

### Repository pattern

```typescript
@Injectable()
export class UserRepository {
  constructor(private databaseService: DatabaseService) {}
  
  async findAll(): Promise<User[]> {
    return await this.databaseService.find('users', {});
  }
  
  async findById(id: string): Promise<User | null> {
    const users = await this.databaseService.find('users', { _id: id });
    return users[0] || null;
  }
  
  async create(userData: CreateUserDto): Promise<User> {
    return await this.databaseService.create('users', userData);
  }
}

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}
  
  async getUsers() {
    return await this.userRepository.findAll();
  }
  
  async getUserById(id: string) {
    return await this.userRepository.findById(id);
  }
}
```

## Tests avec injection de dépendances

### Mocking des services

```typescript
// Test du contrôleur
describe('UserController', () => {
  let controller: UserController;
  let mockUserService: jest.Mocked<UserService>;
  
  beforeEach(() => {
    mockUserService = {
      getUsers: jest.fn(),
      createUser: jest.fn()
    } as any;
    
    controller = new UserController(mockUserService);
  });
  
  it('should get users', async () => {
    const mockUsers = [{ id: '1', name: 'Test' }];
    mockUserService.getUsers.mockResolvedValue(mockUsers);
    
    const result = await controller.getUsers();
    
    expect(result).toEqual(mockUsers);
    expect(mockUserService.getUsers).toHaveBeenCalled();
  });
});
```

### Tests d'intégration

```typescript
describe('UserService Integration', () => {
  let userService: UserService;
  let databaseService: DatabaseService;
  
  beforeEach(() => {
    databaseService = new DatabaseService();
    userService = new UserService(databaseService);
  });
  
  it('should create and retrieve user', async () => {
    const userData = { name: 'Test User', email: 'test@example.com' };
    
    const createdUser = await userService.createUser(userData);
    expect(createdUser.name).toBe(userData.name);
    
    const retrievedUser = await userService.getUserById(createdUser.id);
    expect(retrievedUser).toEqual(createdUser);
  });
});
```

## Gestion des erreurs

### Services avec gestion d'erreurs

```typescript
@Injectable()
export class UserService {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService
  ) {}
  
  async getUsers() {
    try {
      return await this.databaseService.find('users', {});
    } catch (error) {
      this.logger.error('Erreur lors de la récupération des utilisateurs', error);
      throw new HttpError(500, 'Erreur de base de données');
    }
  }
}
```

### Middleware de gestion d'erreurs

```typescript
@Injectable()
export class ErrorHandlingService {
  constructor(private logger: LoggerService) {}
  
  handleError(error: Error, context: string) {
    this.logger.error(`Erreur dans ${context}:`, error);
    
    if (error instanceof HttpError) {
      return error;
    }
    
    return new HttpError(500, 'Erreur interne du serveur');
  }
}
```

## Bonnes pratiques

### Structure des services

- **Services atomiques** : Chaque service a une responsabilité unique
- **Injection par constructeur** : Utilisez toujours l'injection par constructeur
- **Interfaces** : Définissez des interfaces pour vos services

```typescript
interface IUserService {
  getUsers(): Promise<User[]>;
  createUser(userData: CreateUserDto): Promise<User>;
}

@Injectable()
export class UserService implements IUserService {
  // Implémentation
}
```

### Gestion du cycle de vie

- **Singleton** pour les services coûteux (base de données, cache)
- **Request** pour les services spécifiques à une requête
- **Transient** pour les services légers et stateless

### Éviter les anti-patterns

```typescript
// ❌ Mauvaise pratique - Service locator
@Controller('/api/users')
export class UserController {
  constructor() {}
  
  @Get('/')
  getUsers() {
    const userService = Container.get(UserService); // Anti-pattern
    return userService.getUsers();
  }
}

// ✅ Bonne pratique - Injection par constructeur
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
}
```

## Exemples complets

### Application complète avec DI

```typescript
// Services
@Injectable()
export class ConfigService {
  get(key: string) {
    return process.env[key];
  }
}

@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}
  
  async connect() {
    const url = this.configService.get('DATABASE_URL');
    // Logique de connexion
  }
}

@Injectable()
export class UserRepository {
  constructor(private databaseService: DatabaseService) {}
  
  async findAll() {
    return await this.databaseService.find('users', {});
  }
}

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}
  
  async getUsers() {
    return await this.userRepository.findAll();
  }
  
  async createUser(userData: CreateUserDto) {
    const user = await this.userRepository.create(userData);
    await this.emailService.sendWelcomeEmail(user.email);
    return user;
  }
}

// Contrôleur
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}
  
  @Get('/')
  getUsers() {
    return this.userService.getUsers();
  }
  
  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }
}

// Application
const app = new YasuiApp({
  port: 3000
});

app.registerControllers([UserController]);
```

Cette approche d'injection de dépendances rend votre code modulaire, testable et facile à maintenir. 