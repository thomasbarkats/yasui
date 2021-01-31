import express from 'express';
import {
    Controller, Middleware, Get, Post, Put,
    Req, Res, Next, Param, Header,
    HttpStatus, logger
} from '..';


export class TestsMiddleware {

    @Middleware()
    public static hello(
        @Req() req: express.Request,
        @Next() next: express.NextFunction
    ): void {
        logger.log('Hello World!', req.source);
        next();
    }

    /**
     * middlewares can also be written with classic express syntax
     */
    public static warning(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): void {
        logger.warn('Oh ! It\'s a post !', req.source);
        next();
    }
}


@Controller('/tests', TestsMiddleware.hello)
export class TestsController {

    @Get('/:name')
    private get(
        @Param('name') name: string,
        @Res() res: express.Response
    ): void {
        res.status(HttpStatus.OK).json({ message: `Hello ${name}!` });
    }

    @Post('/', TestsMiddleware.warning)
    private post(
        @Header('name') name: string,
        @Res() res: express.Response
    ): void {
        res.status(HttpStatus.OK).json({ message: `${name} say hello!` });
    }

    @Put('/')
    private error(): void {
        throw new Error('I just simulate an error.');
    }
}
