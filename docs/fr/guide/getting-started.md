# Démarrage rapide

Bienvenue sur YasuiJS ! Ce guide vous accompagnera dans la création de votre première API depuis zéro. À la fin, vous aurez une API REST entièrement fonctionnelle avec une structure appropriée et les meilleures pratiques.

## Ce que vous allez construire

Nous allons créer une API simple de gestion d'utilisateurs qui démontre les fonctionnalités principales de YasuiJS :
- Opérations CRUD utilisateur (Créer, Lire, Mettre à jour, Supprimer)
- Injection de dépendances avec des services
- Extraction et validation de paramètres
- Gestion d'erreurs de base

## Prérequis

Avant de commencer, assurez-vous d'avoir :

- **Node.js** (version 16 ou supérieure) - [Télécharger ici](https://nodejs.org/)
- **npm** ou **yarn** comme gestionnaire de paquets
- Connaissances de base en **TypeScript** et **Express.js**

Vous pouvez vérifier votre version de Node.js avec :
```bash
node --version
```

## Étape 1 : Configuration du projet

Commençons par créer un nouveau projet et installer les dépendances nécessaires.

### Créer un nouveau répertoire
```bash
mkdir mon-api-yasui
cd mon-api-yasui
```

### Initialiser le projet
```bash
npm init -y
```

### Installer les dépendances
```bash
npm install yasui express
npm install -D typescript @types/node ts-node nodemon
```

### Configuration TypeScript
Créez un fichier `tsconfig.json` :

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Scripts package.json
Mettez à jour votre `package.json` pour inclure des scripts utiles :

```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

## Étape 2 : Créer votre premier contrôleur

Les contrôleurs sont le cœur de votre application YasuiJS. Ils gèrent les requêtes HTTP entrantes et retournent les réponses.

Créez le fichier `src/controllers/user.controller.ts` :

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from 'yasui';

// Définir nos types de données
interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface CreateUserDto {
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

@Controller('/api/users')
export class UserController {
  
  // Stockage en mémoire pour cet exemple
  private users: User[] = [
    { 
      id: '1', 
      name: 'Jean Dupont', 
      email: 'jean@exemple.com',
      createdAt: new Date()
    },
    { 
      id: '2', 
      name: 'Marie Martin', 
      email: 'marie@exemple.com',
      createdAt: new Date()
    }
  ];

  // GET /api/users - Obtenir tous les utilisateurs avec pagination optionnelle
  @Get('/')
  getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = this.users.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: this.users.length,
        totalPages: Math.ceil(this.users.length / limit)
      }
    };
  }

  // GET /api/users/:id - Obtenir un utilisateur spécifique
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.users.find(user => user.id === id);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return user;
  }

  // POST /api/users - Créer un nouvel utilisateur
  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  // PUT /api/users/:id - Mettre à jour un utilisateur
  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData
    };
    
    return this.users[userIndex];
  }

  // DELETE /api/users/:id - Supprimer un utilisateur
  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }
    
    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    
    return { message: 'Utilisateur supprimé avec succès', user: deletedUser };
  }
}
```

## Étape 3 : Créer votre application

Maintenant, créons le fichier d'application principal qui lie tout ensemble.

Créez `src/app.ts` :

```typescript
import { YasuiApp } from 'yasui';
import { UserController } from './controllers/user.controller';

// Créer l'application YasuiJS
const app = new YasuiApp({
  port: 3000,
  debug: true, // Activer le mode debug pour le développement
  cors: true   // Activer CORS pour l'intégration frontend
});

// Enregistrer vos contrôleurs
app.registerControllers([UserController]);

// Démarrer le serveur
app.start().then(() => {
  console.log('🚀 L\'API YasuiJS fonctionne sur http://localhost:3000');
  console.log('📚 Documentation API disponible sur http://localhost:3000/api-docs');
});
```

## Étape 4 : Exécuter votre application

Maintenant, il est temps de voir votre API en action !

```bash
npm run dev
```

Vous devriez voir une sortie comme :
```
🚀 L'API YasuiJS fonctionne sur http://localhost:3000
📚 Documentation API disponible sur http://localhost:3000/api-docs
```

## Étape 5 : Tester votre API

Testons tous les endpoints que nous avons créés. Vous pouvez utiliser curl, Postman ou n'importe quel client API.

### Obtenir tous les utilisateurs
```bash
curl http://localhost:3000/api/users
```

### Obtenir les utilisateurs avec pagination
```bash
curl "http://localhost:3000/api/users?page=1&limit=5"
```

### Obtenir un utilisateur spécifique
```bash
curl http://localhost:3000/api/users/1
```

### Créer un nouvel utilisateur
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Dubois", "email": "alice@exemple.com"}'
```

### Mettre à jour un utilisateur
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "Jean Mis à jour"}'
```

### Supprimer un utilisateur
```bash
curl -X DELETE http://localhost:3000/api/users/2
```

## Étape 6 : Ajouter une couche service

Maintenant, améliorons notre code en ajoutant une couche service. Cela sépare la logique métier du contrôleur.

Créez `src/services/user.service.ts` :

```typescript
import { Injectable } from 'yasui';

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface CreateUserDto {
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

@Injectable()
export class UserService {
  private users: User[] = [
    { 
      id: '1', 
      name: 'Jean Dupont', 
      email: 'jean@exemple.com',
      createdAt: new Date()
    },
    { 
      id: '2', 
      name: 'Marie Martin', 
      email: 'marie@exemple.com',
      createdAt: new Date()
    }
  ];

  getAllUsers(page: number = 1, limit: number = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = this.users.slice(startIndex, endIndex);
    
    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: this.users.length,
        totalPages: Math.ceil(this.users.length / limit)
      }
    };
  }

  getUserById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  createUser(userData: CreateUserDto): User {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData,
      createdAt: new Date()
    };
    
    this.users.push(newUser);
    return newUser;
  }

  updateUser(id: string, userData: UpdateUserDto): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    this.users[userIndex] = { ...this.users[userIndex], ...userData };
    return this.users[userIndex];
  }

  deleteUser(id: string): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;
    
    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    
    return deletedUser;
  }
}
```

Maintenant, mettez à jour votre contrôleur pour utiliser le service :

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from 'yasui';
import { UserService } from '../services/user.service';

interface CreateUserDto {
  name: string;
  email: string;
}

interface UpdateUserDto {
  name?: string;
  email?: string;
}

@Controller('/api/users')
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/')
  getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10
  ) {
    return this.userService.getAllUsers(page, limit);
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.userService.getUserById(id);
    
    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return user;
  }

  @Post('/')
  createUser(@Body() userData: CreateUserDto) {
    return this.userService.createUser(userData);
  }

  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    const updatedUser = this.userService.updateUser(id, userData);
    
    if (!updatedUser) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return updatedUser;
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    const deletedUser = this.userService.deleteUser(id);
    
    if (!deletedUser) {
      throw new Error('Utilisateur non trouvé');
    }
    
    return { message: 'Utilisateur supprimé avec succès', user: deletedUser };
  }
}
```

## Étape 7 : Ajouter un middleware de base

Ajoutons un middleware pour la journalisation et la validation de base.

Créez `src/middleware/logging.middleware.ts` :

```typescript
import { Request, Response, NextFunction } from 'express';

export function loggingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
}
```

Mettez à jour votre `src/app.ts` pour inclure le middleware :

```typescript
import { YasuiApp } from 'yasui';
import { UserController } from './controllers/user.controller';
import { loggingMiddleware } from './middleware/logging.middleware';

const app = new YasuiApp({
  port: 3000,
  debug: true,
  cors: true,
  middleware: [loggingMiddleware] // Ajouter le middleware global
});

app.registerControllers([UserController]);

app.start().then(() => {
  console.log('🚀 L\'API YasuiJS fonctionne sur http://localhost:3000');
  console.log('📚 Documentation API disponible sur http://localhost:3000/api-docs');
});
```

## Structure du projet

Votre structure de projet finale devrait ressembler à ceci :

```
mon-api-yasui/
├── src/
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── services/
│   │   └── user.service.ts
│   ├── middleware/
│   │   └── logging.middleware.ts
│   └── app.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Ce que vous avez appris

Félicitations ! Vous avez créé avec succès une API YasuiJS complète avec :

- **Contrôleurs** : Gèrent les requêtes HTTP et les réponses
- **Services** : Contiennent la logique métier avec injection de dépendances
- **Middleware** : Traitent les requêtes globalement
- **Extraction de paramètres** : Extraction automatique des paramètres de requête, du corps, etc.
- **Gestion d'erreurs** : Gestion d'erreurs de base avec try-catch
- **TypeScript** : Sécurité de type complète dans toute l'application

## Prochaines étapes

Maintenant que vous avez une API fonctionnelle, vous pouvez explorer des fonctionnalités plus avancées :

1. **Ajouter l'authentification** : Apprendre les middlewares et l'authentification dans le [Guide des middlewares](/fr/reference/middleware)
2. **Générer la documentation** : Ajouter des décorateurs Swagger pour la documentation automatique d'API
3. **Intégration de base de données** : Connecter à une vraie base de données en utilisant des services
4. **Validation** : Ajouter la validation de requêtes et la gestion d'erreurs
5. **Tests** : Écrire des tests unitaires et d'intégration pour votre API

## Dépannage

### Problèmes courants

**Port déjà utilisé** : Si vous obtenez une erreur concernant le port 3000 occupé, changez le port dans votre configuration :
```typescript
const app = new YasuiApp({
  port: 3001  // Utiliser un port différent
});
```

**Erreurs TypeScript** : Assurez-vous que votre `tsconfig.json` a les bons paramètres de décorateurs :
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**Résolution de modules** : Si vous obtenez des erreurs d'import, assurez-vous que vos chemins de fichiers sont corrects et que TypeScript est correctement configuré.

## Besoin d'aide ?

Si vous rencontrez des problèmes ou avez des questions :

1. Consultez le guide [Concepts de base](/fr/guide/basic-concepts) pour des explications détaillées
2. Consultez la [Référence des décorateurs](/fr/reference/decorators) pour tous les décorateurs disponibles
3. Regardez les [Exemples dans le code source](https://github.com/thomasbarkats/yasui/tree/main/src/examples) pour des cas d'usage plus complexes

Bon codage avec YasuiJS ! 