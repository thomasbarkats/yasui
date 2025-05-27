# Yasui
Light framework using Express for Node.js applications.

<img src="https://raw.githubusercontent.com/thomasbarkats/assets/refs/heads/main/yasui/yasui-logo-mascot.png" alt="Logo" height=170></a>

Yasui can mean "easy" in Japanese. Yasui is meant to be easy to use, light, going to essentials only, with few dependencies.
Yasui simplifies REST API development by providing you tools to quickly implement your controllers, middleware, endpoints, server, and also provides complete errors management (logs and client responses), logging service, and dependency injection system.

## Get started
```sh
$ npm install yasui
```
```ts
import yasui from 'yasui';
yasui.createServer({ });
```

`createServer` will create an http server and listen it.
Use `yasui.createApp({ })`, that return an express application, if you want to perform additional operations on it before listening the server and use your own listening method.

Browse the [`src/examples`](./src/examples) folder to get a simple example of a server with Yasui, including controllers, services, middlewares, dependency injection, and error handling. Run it with `npm run example`.

## Configuration
`createServer` and `createApp` takes a configuration object with the following parameters:

| Parameter | Description |
| :-------- | :-----------|
| controllers | An array containing your controllers (classes using the `@Controller` decorator). |
| middlewares | An array containing your application level middlewares (classes using the `@Middleware` decorator). |
| environment | The name of your environment. |
| port | The listening port of your server (not needed in `createApp`). *3000* by default |
| debug | Boolean, display logs more provided if true, and logs all incoming requests. |

## Controllers
Yasui provides decorators to define your controllers and endpoints.

The `Controller` decorator takes in parameter the root path of its endpoints.
The methods of your controller can be decorated with the following: `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`. These take in parameter the relative path of the endpoint.

The parameters of your endpoint can be decorated with the following: `@Res`, `@Req`, `@Next`, to reflect express arguments, or with `@Param`, `@Body`, `@Query`, `@Header` to select a specific parameter from the query, or a subset of it ; they can take the name of the desired parameter as a parameter, in which case they will return the whole set.

You can directly return any kind of data, it will be automatically sended to the client in JSON format with status code 200 by default. `@HttpStatus` decorator allow you to specify the default status code.

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
Yasui provides also decorators to define your middlewares like controllers and use its at application, controller, or endpoint level.

The `Middleware` decorator does not take parameter.
The parameters of your middleware can be decorated with the same decorators as controller endpoints.
Your middleware must obligatorily implement an `use()` method, which will define the execution function of it. `next()` will be automatically executed at the end if nothing is returned.

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
Yasui provides a complete dependency injection system with automatic resolution of dependencies and sophisticated scope management.

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

**Scope Inheritance:**
- `LOCAL` and `DEEP_LOCAL` scopes are inherited by sub-dependencies
- `SHARED` scope doesn't propagate, allowing sub-dependencies to use their own specified scope

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

// Basic logging
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


## Features Summary
- **Lightweight**: Built on Express with minimal dependencies
- **Decorator-based**: Clean, readable code with TypeScript decorators
- **Dependency Injection**: Automatic resolution with scope management
- **Auto Error Handling**: Comprehensive error catching, logging, and formatting
- **Built-in Logging**: Timed logging service with color-coded output
- **Flexible Middleware**: Application, controller, and endpoint-level middleware support
- **Type-safe**: Full TypeScript support with proper typing

## Contributing
Contributions are welcome! Please feel free to submit issues and pull requests.

Please use `npm run commit` to standardize commits nomenclature.

## License
This project is licensed under the [GNU Affero General Public License v3.0 or later](https://www.gnu.org/licenses/agpl-3.0.html). See the [LICENSE](./LICENSE) file for details.