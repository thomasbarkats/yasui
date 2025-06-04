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
`createServer` and `createApp` takes a configuration object including the following parameters:

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
import { Get, Controller, Res, Param, HttpStatus } from 'yasui';

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
import { logger, Middleware, Param } from 'yasui';

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
@Controller('/:name', YourMiddleware1, YourMiddleware2)
private myEndpoint() { /* ... */ }

// Controller middleware(s) will precede endpoint middleware(s)
```

## Dependency Injection
Yasui provides a complete dependency injection system with automatic resolution of dependencies and scope management.

### Injectable Services
Use the `@Injectable()` decorator to mark a class as injectable:

```ts
import { Injectable } from 'yasui';

@Injectable() // Required
export class UserService {

    getUser(id: string) {
        // Your logic...
    }
}
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
// You need to register custom tokens in your app config
yasui.createServer({
    ...yourConfig,
    injections: [
        { token: 'DATABASE_URL', provide: 'postgresql://localhost:5432/mydb' },
        { token: 'CONFIG', provide: { apiKey: 'xxx', timeout: 5000 } }
    ]
});
```

## Logging Service
Yasui includes a built-in logging service with timing capabilities and color-coded output.

### Basic Usage
```ts
import { Injectable, LoggerService } from 'yasui';

@Injectable()
export class YourService {
    constructor(private readonly logger: LoggerService) {}
    
    yourMethod(id: string) {
        logger.log('Application started');
        logger.debug('Debug information');
        logger.success('Operation completed');
        logger.warn('Warning message');
        logger.error('Error occurred');
    }
}
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
        // ... fetch data
        logger.success(`Data fetched in ${logger.getTime()}ms`);
        return data;
    }
}
```

## Error Management
Yasui provides automatic error handling and formatting for both logging and client responses.

### Automatic Error Catching
All controller methods are automatically wrapped with error handling. Any thrown error will be:
- Logged with detailed information (URL, method, status, message)
- Formatted and sent to the client as a JSON response including HTTP status code, error details, request information, and any additional error data (see "Custom Error Handling")

### Custom Error Handling
Create custom errors with specific status codes and additional data by extending the `HttpError` interface. Your custom error must include a `status` property and can include any additional properties:

```ts
import { Get, HttpCode, HttpError } from 'yasui';

class CustomError extends HttpError {
    status: HttpCode;
    customAttribute: any;

    constructor(message: string, customAttribute: any) {
        super(message);
        this.status = HttpCode.BAD_REQUEST;
        this.customAttribute = customAttribute;
    }
}

@Get('/protected')
getProtectedData() {
    throw new CustomError('Access denied', ...yourData);
}
```

### Decorator Validation
Yasui automatically validates your decorators at startup to catch common configuration errors, such as circular dependencies or missing parameter decorators. These errors don't stop the server from running but will cancel the build of the affected controller and display error details after server initialization.

You can disable these controls in the Yasui configuration with `enableDecoratorValidation: false` (unsafe!!)

## API Documentation (Swagger)
Yasui provides OpenAPI documentation generation with optional Swagger UI integration.

### Basic Usage

Enable Swagger by adding configuration to your app:

```ts
yasui.createServer({
    // ... your config
    swagger: {
        enabled: true,
        path: '/api-docs', // optional, defaults to '/api-docs'
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API documentation'
        }
    }
});
```

**Note**: You need to install `swagger-ui-express` separately:
```sh
npm install swagger-ui-express
```

Yasui automatically generates documentation from your existing decorators, then accessible through specified path. JSON specification will always be accessible via `/api-docs.json`.

### Enhanced Documentation
Enrich the default API documentation with optional decorators, all to be attached to the endpoint's method:

- `@ApiOperation(summary, description?, tags?)` - Describe the endpoint
- `@ApiParam(name, description?, required?, schema?)` - Document path parameters
- `@ApiQuery(name, description?, required?, schema?)` - Document query parameters  
- `@ApiHeader(name, description?, required?, schema?)` - Document headers
- `@ApiBody(description?, schema?)` - Document request body
- `@ApiResponse(statusCode, description, schema?)` - Document responses

### Error Response Documentation

`ErrorResourceSchema` generates a schema for Yasui's error wrapper format (see "Custom Error Handling" section). You can optionally define the additional fields that will be included in the `data` property for your custom errors :
```ts
@ApiResponse(400, 'Bad Request ...', ErrorResourceSchema({
    customAttribute: { type: 'string', description: 'Custom attribute' },
}, {
    customAttribute: 'Additional information',
}))
```

## Contributing
Contributions are welcome! Please feel free to submit issues and pull requests.

Please use `npm run commit` to standardize commits nomenclature.

## License
This project is licensed under the [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). See the [LICENSE](./LICENSE) file for details.
