import express from 'express';
import { Get, Controller, Post, logger } from '..';
import { Res, Param, Header } from '../decorators';
import { HttpStatus } from '../types/enums';


export class TestsMiddleware {

    public static hello(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): void {
        logger.log('Hello World!', req.source);
        next();
    }

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

    @Get('/error')
    private error(): void {
        throw new Error('I just simulate an error.');
    }
}
