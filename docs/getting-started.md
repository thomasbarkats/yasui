# Getting Started

Welcome to YasuiJS! This guide will help you get up and running with your first YasuiJS API in minutes.

## Prerequisites

Before you begin, make sure you have:

- **Node.js** (version 16 or higher)
- **npm** or **yarn** package manager
- Basic knowledge of **TypeScript** and **Express.js**

## Installation

Install YasuiJS using npm:

```bash
npm install yasui
```

Or using yarn:

```bash
yarn add yasui
```

## Quick Start

### 1. Create Your First Controller

Create a new file `src/controllers/user.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Param } from 'yasui';

interface User {
  id: string;
  name: string;
  email: string;
}

@Controller('/api/users')
export class UserController {
  
  private users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  @Get('/')
  getAllUsers(): User[] {
    return this.users;
  }

  @Get('/:id')
  getUser(@Param('id') id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  @Post('/')
  createUser(@Body() user: Omit<User, 'id'>): User {
    const newUser: User = {
      id: Date.now().toString(),
      ...user
    };
    this.users.push(newUser);
    return newUser;
  }
}
```

### 2. Create Your Application

Create `src/app.ts`:

```typescript
import { YasuiApp } from 'yasui';
import { UserController } from './controllers/user.controller';

const app = new YasuiApp({
  port: 3000,
  debug: true
});

// Register controllers
app.registerControllers([UserController]);

// Start the server
app.start();
```

### 3. Run Your Application

Add a script to your `package.json`:

```json
{
  "scripts": {
    "dev": "ts-node src/app.ts",
    "build": "tsc",
    "start": "node dist/app.js"
  }
}
```

Run your application:

```bash
npm run dev
```

Your API is now running at `http://localhost:3000`!

## Testing Your API

You can test your endpoints using curl or any API client:

```bash
# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1

# Create a new user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson", "email": "alice@example.com"}'
```

## Project Structure

Here's a recommended project structure for a YasuiJS application:

```
src/
├── controllers/          # API controllers
│   ├── user.controller.ts
│   └── auth.controller.ts
├── services/            # Business logic
│   ├── user.service.ts
│   └── auth.service.ts
├── middleware/          # Custom middleware
│   ├── auth.middleware.ts
│   └── validation.middleware.ts
├── models/             # Data models and DTOs
│   ├── user.model.ts
│   └── auth.model.ts
├── config/             # Configuration files
│   └── app.config.ts
└── app.ts              # Main application file
```

## Adding Services with Dependency Injection

Let's enhance our example with a service layer:

### 1. Create a Service

Create `src/services/user.service.ts`:

```typescript
import { Injectable } from 'yasui';

interface User {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class UserService {
  private users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com' }
  ];

  getAllUsers(): User[] {
    return this.users;
  }

  getUserById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  createUser(userData: Omit<User, 'id'>): User {
    const newUser: User = {
      id: Date.now().toString(),
      ...userData
    };
    this.users.push(newUser);
    return newUser;
  }
}
```

### 2. Update Your Controller

Update `src/controllers/user.controller.ts`:

```typescript
import { Controller, Get, Post, Body, Param } from 'yasui';
import { UserService } from '../services/user.service';

@Controller('/api/users')
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get('/:id')
  getUser(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @Post('/')
  createUser(@Body() user: { name: string; email: string }) {
    return this.userService.createUser(user);
  }
}
```

## Adding Middleware

### 1. Create Custom Middleware

Create `src/middleware/auth.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ error: 'Authorization token required' });
  }
  
  // Add your token validation logic here
  if (token !== 'valid-token') {
    return res.status(403).json({ error: 'Invalid token' });
  }
  
  next();
}
```

### 2. Apply Middleware

Apply middleware to your controller:

```typescript
import { Controller, Get, Post, Body, Param, Middleware } from 'yasui';
import { UserService } from '../services/user.service';
import { authMiddleware } from '../middleware/auth.middleware';

@Controller('/api/users')
@Middleware([authMiddleware])
export class UserController {
  
  constructor(private userService: UserService) {}

  @Get('/')
  getAllUsers() {
    return this.userService.getAllUsers();
  }

  // This route will require authentication
  @Post('/')
  createUser(@Body() user: { name: string; email: string }) {
    return this.userService.createUser(user);
  }
}
```

## Configuration Options

YasuiJS supports various configuration options:

```typescript
import { YasuiApp } from 'yasui';

const app = new YasuiApp({
  port: 3000,                    // Server port
  debug: true,                   // Enable debug mode
  cors: true,                    // Enable CORS
  jsonLimit: '10mb',            // JSON body size limit
  swagger: {                     // Swagger configuration
    enabled: true,
    path: '/api-docs'
  },
  middleware: [                  // Global middleware
    // Add your global middleware here
  ]
});
```

## Next Steps

Now that you have a basic YasuiJS application running, you can:

1. **Explore Decorators**: Learn about all available decorators in the [Decorators Guide](/en/guide/decorators)
2. **Add Swagger Documentation**: Generate API documentation with [Swagger Decorators](/en/guide/swagger)
3. **Implement Authentication**: Add security with [Middleware Guide](/en/guide/middleware)
4. **Database Integration**: Connect to databases using services
5. **Error Handling**: Implement proper error handling with [Error Handling Guide](/en/guide/error-handling)

## Troubleshooting

### Common Issues

**TypeScript Configuration**: Make sure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "commonjs"
  }
}
```

**Port Already in Use**: If port 3000 is busy, change the port in your configuration:

```typescript
const app = new YasuiApp({
  port: 3001  // Use a different port
});
```

**Module Resolution**: If you encounter module resolution issues, make sure your import paths are correct and your TypeScript configuration is properly set up.

## Need Help?

If you encounter any issues or have questions:

1. Check the [Basic Concepts](/en/guide/basic-concepts) guide
2. Review the [API Reference](/en/api/) documentation
3. Look at the [Examples](/en/examples/) for more complex use cases

Happy coding with YasuiJS! 🚀 