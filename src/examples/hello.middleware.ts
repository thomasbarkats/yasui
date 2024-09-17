import { Logger, Middleware, Req } from '..';
import { LoggerService } from '../services';
import { TestsService } from './tests.service';
import { IMiddleware } from '../types/interfaces';
import { Request } from 'express';


@Middleware()
export class HelloMiddleware implements IMiddleware {

    /** middlewares allow service injections */
    constructor(private readonly testsService: TestsService) {}


    /** middlewares must have an unique use() method */
    use(
        @Req() req: Request,
        @Logger() logger: LoggerService, // each request has its own timed logger
    ): void {
        logger.log(`Request ${req.method} ${req.path} ...`, req.source);
        this.testsService.helloWorld(req.source);
    }
}
