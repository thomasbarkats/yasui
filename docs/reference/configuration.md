# Configuration Reference

This reference lists all configuration options for YasuiJS applications.

## Usage

Pass a configuration object to the YasuiJS `Core`, `createServer`, or `createApp` function:

```typescript
import { Core } from 'yasui';
const config = { /* ... */ };
const app = new Core(config).createApp();
```

## Configuration Options

| Option                    | Type                       | Default      | Description |
|---------------------------|----------------------------|--------------|-------------|
| `controllers`             | `Class[]`                  | `[]`         | Array of controller classes to register |
| `middlewares`             | `Class[]`                  | `[]`         | Array of global middleware classes |
| `swagger`                 | `object`                   | `undefined`  | Swagger/OpenAPI config (see below) |
| `debug`                   | `boolean`                  | `false`      | Enable debug logging and error output |
| `apiKey`                  | `string`                   | `undefined`  | API key for global authentication |
| `injections`              | `{token, provide}[]`       | `[]`         | Custom DI tokens and values/classes |
| `enableDecoratorValidation`| `boolean`                 | `true`       | Enable/disable decorator validation |
| `port`                    | `number`                   | `3000`       | Port for HTTP server (if using createServer) |
| `environment`             | `string`                   | `undefined`  | Environment name (for logging) |

## Swagger Configuration

`swagger` is an object with:
- `generate`: `boolean` — Enable/disable Swagger docs
- `path`: `string` — Path for Swagger UI (default: `/api-docs`)
- `info`: `object` — OpenAPI info (title, version, description, etc.)
- `servers`: `array` — List of server objects for OpenAPI

Example:
```typescript
swagger: {
  generate: true,
  path: '/api-docs',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'A sample API',
    contact: { name: 'Support', email: 'support@example.com' },
    license: { name: 'MIT', url: 'https://opensource.org/licenses/MIT' }
  },
  servers: [
    { url: 'http://localhost:3000', description: 'Dev' }
  ]
}
```

## Example Minimal Config

```typescript
const config = {
  controllers: [UserController],
  middlewares: [LoggingMiddleware],
  swagger: { generate: true },
  debug: true,
  apiKey: 'secret',
  injections: [
    { token: 'DATABASE_URL', provide: 'postgres://...' }
  ],
  enableDecoratorValidation: true,
  port: 3000,
  environment: 'development'
};
```

## Notes
- All options are optional except `controllers` (should have at least one controller).
- `middlewares` are applied in order before controllers.
- `injections` can be used for custom DI tokens or values.
- `swagger` is optional; if omitted, Swagger docs are disabled. 