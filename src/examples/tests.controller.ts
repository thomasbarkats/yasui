import express from 'express';
import {
    Controller, Middleware, Get, Post, Put,
    Req, Res, Next, Param, Header,
    HttpStatus, logger
} from '..';
import { TestsService } from './tests.service';


export class TestsMiddleware {

    @Middleware()
    public static warning(
        @Req() req: express.Request,
        @Next() next: express.NextFunction
    ): void {
        logger.warn('Oh ! It\'s a post !', req.source);
        next();
    }

    /** middlewares can also be written with classic express syntax */
    public static hello(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ): void {
        logger.log('Hello World!', req.source);
        next();
    }
}


@Controller('/tests', TestsMiddleware.hello)
export class TestsController {
    private testsService: TestsService;

    constructor() {
        this.testsService = new TestsService();
    }

    @Get('/:name')
    private get(
        @Param('name') name: string,
        @Res() res: express.Response
    ): void {
        const message: string = this.testsService.getMessage(name);
        res.status(HttpStatus.OK).json({ message });
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
