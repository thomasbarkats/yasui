# Getting Started

Welcome to YasuiJS! This guide will walk you through creating your first API from scratch. By the end, you'll have a fully functional REST API with proper structure and best practices.

## What You'll Build

We'll create a simple user management API that demonstrates the core features of YasuiJS:
- User CRUD operations (Create, Read, Update, Delete)
- Dependency injection with services
- Parameter extraction and validation
- Basic error handling

## Prerequisites

Before we begin, make sure you have:

- **Node.js** (version 16 or higher) - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- Basic knowledge of **TypeScript** and **Express.js**

You can check your Node.js version with:
```bash
node --version
```

## Step 1: Project Setup

Let's start by creating a new project and installing the necessary dependencies.

### Create a New Directory
```bash
mkdir my-yasui-api
cd my-yasui-api
```

### Initialize the Project
```bash
npm init -y
```

### Install Dependencies
```bash
npm install yasui express
npm install -D typescript @types/node ts-node nodemon
```

### TypeScript Configuration
Create a `tsconfig.json` file:

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

### Package.json Scripts
Update your `package.json` to include useful scripts:

```json
{
  "scripts": {
    "dev": "nodemon src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

## Step 2: Create Your First Controller

Controllers are the heart of your YasuiJS application. They handle incoming HTTP requests and return responses.

Create the file `src/controllers/user.controller.ts`:

```typescript
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from 'yasui';

// Define our data types
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
  
  // In-memory storage for this example
  private users: User[] = [
    { 
      id: '1', 
      name: 'John Doe', 
      email: 'john@example.com',
      createdAt: new Date()
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      email: 'jane@example.com',
      createdAt: new Date()
    }
  ];

  // GET /api/users - Get all users with optional pagination
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

  // GET /api/users/:id - Get a specific user
  @Get('/:id')
  getUser(@Param('id') id: string) {
    const user = this.users.find(user => user.id === id);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  // POST /api/users - Create a new user
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

  // PUT /api/users/:id - Update a user
  @Put('/:id')
  updateUser(@Param('id') id: string, @Body() userData: UpdateUserDto) {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData
    };
    
    return this.users[userIndex];
  }

  // DELETE /api/users/:id - Delete a user
  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }
    
    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    
    return { message: 'User deleted successfully', user: deletedUser };
  }
}
```

## Step 3: Create Your Application

Now let's create the main application file that ties everything together.

Create `src/app.ts`:

```typescript
import { YasuiApp } from 'yasui';
import { UserController } from './controllers/user.controller';

// Create the YasuiJS application
const app = new YasuiApp({
  port: 3000,
  debug: true, // Enable debug mode for development
  cors: true   // Enable CORS for frontend integration
});

// Register your controllers
app.registerControllers([UserController]);

// Start the server
app.start().then(() => {
  console.log('🚀 YasuiJS API is running on http://localhost:3000');
  console.log('📚 API Documentation available at http://localhost:3000/api-docs');
});
```

## Step 4: Run Your Application

Now it's time to see your API in action!

```bash
npm run dev
```

You should see output like:
```
🚀 YasuiJS API is running on http://localhost:3000
📚 API Documentation available at http://localhost:3000/api-docs
```

## Step 5: Test Your API

Let's test all the endpoints we created. You can use curl, Postman, or any API client.

### Get All Users
```bash
curl http://localhost:3000/api/users
```

### Get Users with Pagination
```bash
curl "http://localhost:3000/api/users?page=1&limit=5"
```

### Get a Specific User
```bash
curl http://localhost:3000/api/users/1
```

### Create a New User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson", "email": "alice@example.com"}'
```

### Update a User
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{"name": "John Updated"}'
```

### Delete a User
```bash
curl -X DELETE http://localhost:3000/api/users/2
```

## Step 6: Add a Service Layer

Now let's improve our code by adding a service layer. This separates business logic from the controller.

Create `src/services/user.service.ts`:

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
      name: 'John Doe', 
      email: 'john@example.com',
      createdAt: new Date()
    },
    { 
      id: '2', 
      name: 'Jane Smith', 
      email: 'jane@example.com',
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
    
    if (userIndex === -1) {
      return null;
    }
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData
    };
    
    return this.users[userIndex];
  }

  deleteUser(id: string): User | null {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return null;
    }
    
    const deletedUser = this.users[userIndex];
    this.users.splice(userIndex, 1);
    
    return deletedUser;
  }
}
```

Now update your controller to use the service:

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
      throw new Error('User not found');
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
      throw new Error('User not found');
    }
    
    return updatedUser;
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string) {
    const deletedUser = this.userService.deleteUser(id);
    
    if (!deletedUser) {
      throw new Error('User not found');
    }
    
    return { message: 'User deleted successfully', user: deletedUser };
  }
}
```

## Step 7: Add Basic Middleware

Let's add some middleware for logging and basic validation.

Create `src/middleware/logging.middleware.ts`:

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

Update your `src/app.ts` to include the middleware:

```typescript
import { YasuiApp } from 'yasui';
import { UserController } from './controllers/user.controller';
import { loggingMiddleware } from './middleware/logging.middleware';

const app = new YasuiApp({
  port: 3000,
  debug: true,
  cors: true,
  middleware: [loggingMiddleware] // Add global middleware
});

app.registerControllers([UserController]);

app.start().then(() => {
  console.log('🚀 YasuiJS API is running on http://localhost:3000');
  console.log('📚 API Documentation available at http://localhost:3000/api-docs');
});
```

## Project Structure

Your final project structure should look like this:

```
my-yasui-api/
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

## What You've Learned

Congratulations! You've successfully created a complete YasuiJS API with:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic with dependency injection
- **Middleware**: Process requests globally
- **Parameter Extraction**: Automatic extraction of query params, body, etc.
- **Error Handling**: Basic error handling with try-catch
- **TypeScript**: Full type safety throughout the application

## Next Steps

Now that you have a working API, you can explore more advanced features:

1. **Add Authentication**: Learn about middleware and authentication in the [Middleware Guide](/middleware)
2. **Generate Documentation**: Add Swagger decorators for automatic API documentation
3. **Database Integration**: Connect to a real database using services
4. **Validation**: Add request validation and error handling
5. **Testing**: Write unit and integration tests for your API

## Troubleshooting

### Common Issues

**Port Already in Use**: If you get an error about port 3000 being busy, change the port in your configuration:
```typescript
const app = new YasuiApp({
  port: 3001  // Use a different port
});
```

**TypeScript Errors**: Make sure your `tsconfig.json` has the correct decorator settings:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**Module Resolution**: If you get import errors, make sure your file paths are correct and TypeScript is properly configured.

## Need Help?

If you encounter any issues or have questions:

1. Check the [Basic Concepts](/basic-concepts) guide for detailed explanations
2. Review the [Decorators Reference](/decorators) for all available decorators
3. Look at the [Examples](/examples/) for more complex use cases

Happy coding with YasuiJS! 