# Configuration

Complete configuration reference for YasuiJS applications using `yasui.createServer()` and `yasui.createApp()`.

## Overview

YasuiJS provides two main ways to create your application:

- **`yasui.createServer(config)`** - Creates and starts an HTTP server automatically
- **`yasui.createApp(config)`** - Returns an Express application for manual configuration

Both methods accept the same configuration object with the following options.

## Configuration Options

### Required Options

#### `controllers`
**Type:** `Array<Constructor>`  
**Description:** Array of controller classes to register in your application.

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController, ProductController]
});
```

### Optional Options

#### `middlewares`
Array of global middlewares to apply to all requests. Can be YasuiJS middleware classes or Express RequestHandler functions.
- **Type:** `Array<Constructor | RequestHandler>`
- **Default:** `[]`
- **Example value:** `[LoggingMiddleware, cors()]`

#### `globalPipes`
Array of global pipes to apply to all route parameters. See [Pipes](/reference/pipes) for details.  
- **Type:** `Array<Constructor<IPipeTransform>>`
- **Default:** `[]`
- **Example value:** `[ValidationPipe, TrimPipe]`

#### `environment`
Environment name for your application.
- **Type:** `string`
- **Default:** `process.env.NODE_ENV || 'development'`
- **Example value:** `production`

#### `port`
Port number for the HTTP server. Only used with `createServer()`.
- **Type:** `number`
- **Default:** `3000`

#### `debug`
Enable debug mode with additional logging and request tracing.
- **Type:** `boolean`
- **Default:** `false`

#### `injections`
Custom injection tokens for dependency injection. See [Dependency Injection](/reference/dependency-injection) for details.
- **Type:** `Array<{ token: string, provide: any }>`
- **Default:** `[]`
- **Example value:**
```typescript
[
  { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
  { token: 'CONFIG', provide: { apiKey: 'secret' } }
]
```

#### `swagger`
Swagger documentation configuration. See [Swagger](/reference/swagger) for details.
- **Type:** `SwaggerConfig | undefined`
- **Default:** `undefined`
- **Example value:**
```typescript
{
  enabled: true,
  path: '/api-docs',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'API documentation'
  }
}
```

#### `enableDecoratorValidation`
Enable validation of decorators at startup to catch configuration errors.
- **Type:** `boolean`
- **Default:** `true`

## createServer() vs createApp()

### createServer()

Creates an HTTP server and starts listening automatically:

```typescript
import yasui from 'yasui';

yasui.createServer({
  controllers: [UserController],
  port: 3000,
  debug: true
});

// Server is automatically started and listening on port 3000
```

**Use when:**
- You want to start your server immediately
- You don't need additional Express configuration
- You're building a simple API

### createApp()

Returns an Express application for manual configuration:

```typescript
import yasui from 'yasui';

const app = yasui.createApp({
  controllers: [UserController]
});

// Add custom Express middleware
app.use('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Add custom routes
app.get('/custom', (req, res) => {
  res.json({ message: 'Custom route' });
});

// Start the server manually
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

**Use when:**
- You need custom Express configuration
- You want to add custom routes or middleware
- You need more control over server startup
- You're integrating with existing Express applications

## Configuration Examples

### Basic API Setup

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  port: 3000,
  debug: true
});
```

### Complete Configuration

```typescript
yasui.createServer({
  controllers: [UserController, AuthController],
  middlewares: [LoggingMiddleware, AuthMiddleware],
  globalPipes: [ValidationPipe, TrimPipe],
  port: 3000,
  debug: false,
  environment: 'production',
  enableDecoratorValidation: true,
  injections: [
    { token: 'DATABASE_URL', provide: process.env.DATABASE_URL },
    { token: 'JWT_SECRET', provide: process.env.JWT_SECRET }
  ],
  swagger: {
    enabled: true,
    path: '/api-docs',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'Complete API with all features'
    }
  }
});
```

### Express Integration

```typescript
import yasui from 'yasui';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = yasui.createApp({
  controllers: [UserController],
  middlewares: [LoggingMiddleware]
});

// Add Express middleware
app.use(cors());
app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// Add custom routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Debug Mode

Enable debug mode to see detailed information:

```typescript
yasui.createServer({
  controllers: [UserController],
  debug: true
});
```

Debug mode provides:
- Request/response logging
- Dependency injection details
- Route registration information
- Error stack traces
