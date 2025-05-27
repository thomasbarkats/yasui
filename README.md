# Yasui

[![npm version](https://badge.fury.io/js/yasui.svg)](https://badge.fury.io/js/yasui)
[![Node.js Version](https://img.shields.io/node/v/yasui.svg)](https://nodejs.org/)
[![npm downloads](https://img.shields.io/npm/dm/yasui.svg)](https://www.npmjs.com/package/yasui)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

Lightweight Express-based framework for REST and web APIs.

<img src="https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot.png" alt="Logo" height=170></a>

Yasui can mean "easy" in Japanese. Yasui is designed to be easy to use, lightweight, and focused on essentials with minimal dependencies.
Yasui simplifies REST API development with tools for controllers, middleware, endpoints, plus complete error management, logging, and dependency injection.

## Features Summary
- **Lightweight**: Built on Express with minimal dependencies
- **Decorator-based**: Clean, readable code with TypeScript decorators
- **Dependency Injection**: Automatic resolution with scope management
- **Auto Error Handling**: Comprehensive error catching, logging, and formatting
- **Built-in Logging**: Timed logging service with color-coded output
- **Flexible Middleware**: Application, controller, and endpoint-level middleware support
- **Type-safe**: Full TypeScript support with proper typing

## Get started
```sh
$ npm install yasui
```
```ts
import yasui from 'yasui';
yasui.createServer({ });
```

`createServer` will create an http server and listen it.
Use `yasui.createApp({ })`, that return an Express application, if you want to perform additional operations on it before listening the server and use your own listening method.

Browse the [`src/examples`](./src/examples) folder to get a simple example of a server with Yasui, including controllers, services, middlewares, dependency injection, and error handling. Run it with `npm run example`.

## Configuration
`createServer` and `createApp` takes a configuration object with the following parameters:

| Parameter | Description |
| :-------- | :-----------|
| controllers | Array of controllers (classes using the `@Controller` decorator) |
| middlewares | Array of middlewares at application level (classes using the `@Middleware` decorator) |
| environment | Name of your environment (String) |
| port | Listening port of your server (only for `createServer` - Number - *3000* by default) |
| debug | Display more logs and logs all incoming requests if true (Boolean) |

## Controllers
Yasui provides decorators to define your controllers and endpoints.

The `Controller` decorator takes the root path of its endpoints as parameter. Your controller methods can be decorated with `Get`, `Post`, `Put`, `Delete`, and `Patch`, each taking the relative path of the endpoint.

Method parameters can be decorated with `Res`, `Req`, `Next` to access Express objects, or with `Param`, `Body`, `Query`, `Header` to extract specific request data. These decorators can take a parameter name to select a specific value, or be used without parameters to get the entire object.

You can directly return any data from your methods - it will be automatically sent as JSON with status 200. Use the `HttpStatus` decorator to specify a different default status code.

### Example
```ts
import express from 'express';
import { Get, Controller, Res, Param, Logger, HttpStatus } from 'yasui';

@Controller('/')
export class MyController {
    @Get('/:name')
    @HttpStatus(201)
    private hello(
        @Param('name') name: string,
        @Res() res: express.Response
    ): string {
        return `Hello ${name}!`;
    }
}
```

## Middlewares
Yasui provides decorators to define middlewares and use them at application, controller, or endpoint level.

The `Middleware` decorator takes no parameters. Middleware parameters use the same decorators as controller endpoints. Your middleware must implement a `use()` method that defines its behavior. `next()` is automatically called at the end if nothing is returned.

### Example
```ts
import express from 'express';
import { logger, Middleware, Param, Next } from 'yasui';

@Middleware()
export class HelloMiddleware {
    use(
        @Param('name') name: string,
    ): void {
        logger.log(`Hello ${name}`);
    }
}
```

**Usage:**
```ts
// At controller level
@Controller('/', HelloMiddleware)
export class MyController { /* ... */ }

// At endpoint level
@Get('/:name', HelloMiddleware)
private myEndpoint() { /* ... */ }

// Multiple middlewares can be attached, and will be called in order
@Controller('/:name', MyMiddleware1, MyMiddleware2)
private myEndpoint() { /* ... */ }

// Controller middleware(s) will precede endpoint middleware(s)
```

## Dependency Injection
Yasui provides a complete dependency injection system with automatic resolution of dependencies and scope management.

### Injectable Services
Use the `@Injectable()` decorator to mark a class as injectable:

```ts
import { Injectable, LoggerService } from 'yasui';

@Injectable()
export class UserService {
    constructor(private readonly logger: LoggerService) {}
    
    getUser(id: string) {
        this.logger.log(`Fetching user ${id}`);
        // Your logic here
    }
}
```

### Dependency Scopes
Yasui supports three different dependency scopes:

- **SHARED** **(default)**: Singleton instance shared across the application
- **LOCAL**: New instance for each injection context
- **DEEP_LOCAL**: New instance that propagates locality to its own dependencies

Use the `@Scope()` decorator to specify the scope for individual dependencies:

```ts
@Injectable()
export class MyService {
    constructor(
        @Scope(Scopes.LOCAL) private tempService: TempService,
        @Scope(Scopes.DEEP_LOCAL) private isolatedService: IsolatedService,
        private sharedService: SharedService // SHARED by default
    ) {}
}
```

### Custom Injection Tokens
For more complex scenarios, use custom injection tokens with `@Inject()`. This is useful for injecting primitive values, configurations, or when you need multiple instances of the same class:

```ts
@Injectable()
export class DatabaseService {
    constructor(
        @Inject('DATABASE_URL') private dbUrl: string,
        @Inject('CONFIG') private config: AppConfig
    ) {}
}
```

**Registering custom tokens:**
```ts
// You need to register these tokens before building your services
injector.register('DATABASE_URL', 'postgresql://localhost:5432/mydb');
injector.register('CONFIG', { apiKey: 'xxx', timeout: 5000 });
```

### Using Services in Controllers
Simply inject your services in controller constructors:

```ts
@Controller('/users')
export class UserController {
    constructor(private readonly userService: UserService) {}
    
    @Get('/:id')
    getUser(@Param('id') id: string) {
        return this.userService.getUser(id);
    }
}
```

## Logging Service
Yasui includes a built-in logging service with timing capabilities and color-coded output.

### Basic Usage
```ts
import { logger } from 'yasui';

logger.log('Application started');
logger.debug('Debug information');
logger.success('Operation completed');
logger.warn('Warning message');
logger.error('Error occurred');
```

### Timed Logging
The logger includes timing functionality for performance monitoring:

```ts
logger.start(); // Start timer
// ... some operations
const elapsed = logger.stop(); // Stop and get elapsed time
logger.log(`Operation took ${elapsed}ms`);

// Or reset timer without stopping
logger.reset();
```

### In Controllers and Services
Use the `@Logger()` decorator to get a request-specific logger instance:

```ts
@Controller('/api')
export class ApiController {
    @Get('/data')
    getData(@Logger() logger: LoggerService) {
        logger.start();
        // ... fetch data
        logger.success(`Data fetched in ${logger.stop()}ms`);
        return data;
    }
}
```

## Error Management
Yasui provides automatic error handling and formatting for both logging and client responses.

### Automatic Error Catching
All controller methods are automatically wrapped with error handling. Any thrown error will be:
- Logged with detailed information (URL, method, status, message)
- Formatted and sent to the client as a JSON response
- Include appropriate HTTP status codes

### Custom Error Handling
Create custom errors with specific status codes:

```ts
@Get('/protected')
getProtectedData() {
    const error = new Error('Access denied');
    error.status = 403;
    throw error;
}
```

### Error Response Format
Errors are automatically formatted and include:
- HTTP status code and message
- Error details
- Request information (URL, method, path)
- Additional error data

The client receives a structured JSON error response, while detailed logs are written server-side.

## Contributing
Contributions are welcome! Please feel free to submit issues and pull requests.

Please use `npm run commit` to standardize commits nomenclature.

## License
This project is licensed under the [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). See the [LICENSE](./LICENSE) file for details.