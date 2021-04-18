# Yasui
Light framework using Express for Node.js applications.

（◠‿◠）やすいです！

Yasui can mean "easy" in Japanese. Yasui is meant to be easy to use, light, going to essentials only, with few dependencies.
Yasui simplifies your life by providing you tools to quickly implement your controllers, middleware, endpoints, and your server.
Yasui provides also complete errors management (logs and client responses) and logging service.

&nbsp;
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

&nbsp;
## Configuration
`createServer` and `createApp` takes a configuration object with the following parameters:

| Parameter | Description |
| :-------- | :-----------|
| controllers | An array containing your controllers (classes using the `@Controller` decorator). |
| middlewares | An array containing your application level middlewares (classes using the `@Middleware` decorator). |
| environment | The name of your environment. |
| port | The listening port of your server (not needed in `createApp`). *3000* by default |
| debug | Boolean, display logs more provided if true, and logs all incoming requests. |
| apiKey | Authentication key for your API. If provided, all requests should contain the x-api-key header. |

&nbsp;
## Controllers
Yasui provides decorators to define your controllers and endpoints.

The `Controller` decorator takes in parameter the root path of its endpoints.

The methods of your controller can be decorated with the following: `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`. These take in parameter the relative path of the endpoint.

The parameters of your endpoint can be decorated with the following: `@Res`, `@Req`, `@Next`, to reflect express arguments, or with `@Param`, `@Body`, `@Query`, `@Header` to select a specific parameter from the query, or a subset of it ; they can take the name of the desired parameter as a parameter, in which case they will return the whole set.

### Example
```ts
import express from 'express';
import { Get, Controller, Res, Param } from 'yasui';

@Controller('/')
export class MyController {

    @Get('/:name')
    private hello(
        @Param('name') name: string,
        @Res() res: express.Response
    ): void {
        res.status(200).json({ message: `Hello ${name}!` });
    }
}
```

&nbsp;
## Middlewares
Yasui provides also decorators to define your middlewares like controllers and use its at application, controller, or endpoint level.

The `Middleware` decorator does not take parameter.

The parameters of your middleware can be decorated with the same decorators as controller endpoints.

Your middleware must obligatorily implement an `use()` method, which will define the execution function of it.

### Example
```ts
import express from 'express';
import { logger, Middleware, Param, Next } from '..';

@Middleware()
export class HelloMiddleware {
    use(
        @Param('name') name: string,
        @Next() next: express.NextFunction
    ): void {
        logger.log(`Hello ${name}`);
        next();
    }
}
```

```ts
@Controller('/', HelloMiddleware)
// [...]
```

```ts
@Get('/:name', HelloMiddleware)
// [...]
```

&nbsp;
## Injections

Not yet documented.

See `src/examples` folder for examples.
