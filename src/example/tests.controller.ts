import express from 'express';
import { Get, Controller, Post, logger } from '..';
import { HttpStatus } from '../@types/enums';


export abstract class TestsMiddleware {

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


@Controller('/tests')
export class TestsController {

    @Get('/')
    private get(req: express.Request, res: express.Response): void {
        res.status(HttpStatus.OK).json({ message: 'I\'m a simple test.' });
    }

    @Post('/', TestsMiddleware.warning)
    private post(req: express.Request, res: express.Response): void {
        res.status(HttpStatus.OK).json({ message: 'I post a new test.' });
    }

    @Get('/error')
    private error(): void {
        throw new Error('I just simulate an error.');
    }
}
