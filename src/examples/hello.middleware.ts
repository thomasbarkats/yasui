import express from 'express';
import { logger, Middleware, Next, Req } from '..';
import { TestsService } from './tests.service';


@Middleware()
export class HelloMiddleware {

    /** middlewares allow service injections */
    private testsService: TestsService;

    constructor() {
        this.testsService = new TestsService();
    }

    /** middlewares must have an unique use() method */
    use(
        @Req() req: express.Request,
        @Next() next: express.NextFunction
    ): void {
        logger.log(`Request ${req.method} ${req.path} ...`, req.source);
        this.testsService.helloWorld(req.source);
        next();
    }
}
