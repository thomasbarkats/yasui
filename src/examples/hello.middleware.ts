import { NextFunction, Request } from 'express';
import { Logger, Middleware, Next, Req } from '..';
import { LoggerService } from '../services';
import { TestsService } from './tests.service';


@Middleware()
export class HelloMiddleware {

    /** middlewares allow service injections */
    constructor(private testsService: TestsService) {}


    /** middlewares must have an unique use() method */
    use(
        @Req() req: Request,
        @Logger() logger: LoggerService, // each request has its own timed logger
        @Next() next: NextFunction
    ): void {
        logger.log(`Request ${req.method} ${req.path} ...`, req.source);
        this.testsService.helloWorld(req.source);
        next();
    }
}
