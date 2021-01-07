import express from 'express';
import { get } from 'lodash';
import { Get, Controller, Post, logger } from '..';


abstract class TestsMiddleware {

    public static hello(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): void {
        logger.log('Hello World!', get(req, 'source'));
        next();
    }

    public static warning(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): void {
        logger.warn('Oh ! It\'s a post !', get(req, 'source'));
        next();
    }
}


@Controller('/tests', TestsMiddleware.hello)
export class TestsController {

    @Get('/')
    private get(req: express.Request, res: express.Response): void {
        res.status(200).json({ message: 'I\'m a simple test.' });
    }

    @Post('/', TestsMiddleware.warning)
    private post(req: express.Request, res: express.Response): void {
        res.status(200).json({ message: 'I post a new test.' });
    }

    @Get('/error')
    private error(): void {
        throw new Error('I just simulate an error.');
    }
}
