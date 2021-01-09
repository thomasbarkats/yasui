# Yasui
Light framework using Express for Node.js applications.

（◠‿◠）やすいです！

Yasui can mean "easy" in Japanese. Yasui is meant to be easy to use, light, going to essentials only, with few dependencies.
Yasui simplifies your life by providing you tools to quickly implement your controllers, middleware, endpoints, and your server.
Yasui provides also complete error management (logs and client responses), and a simple but complete logging service.


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

## Configuration
`createServer` and `createApp` takes a configuration object that can take the following parameters:

| Parameter | Description |
| ----------------- | -------------------|
| controllers | An array containing your controllers (classes using the `@Controller` decorator). |
| middlewares | A function table of type `express.RequestHandler`. |
| environment | The name of your environment. |
| port | The listening port of your server (not needed in `createApp`). *3000* by default |
| debug | Boolean, display logs more provided if true, and logs all incoming requests. |
| apiKey | Authentication key for your API. If provided, all requests should contain the x-api-key header. |

## Controllers
Yasui provides decorators to define your controllers and endpoints.

The `Controller` decorator takes in parameter the root path of its endpoints.
You can also provide middlewares restricted to your controller.

The methods of your controller can be decorated with the following: `@Get`, `@Post`, `@Put`, `@Delete`, `@Patch`. These take in parameter the relative path of the endpoint.
You can also provide middlewares restricted to your endpoint.

### Example
```ts
import express from 'express';
import { Get, Controller, Post, logger } from 'yasui';

export abstract class MyMiddleware {
    public static log(req, res, next): void {
        console.log('Hello world !')
        next();
    }
}

@Controller('/tests', MyMiddleware.hello)
export class MyController {
    @Get('/')
    private hello(req, res): void {
        res.status(200).json({ message: 'Hello world !' });
    }
}
```
