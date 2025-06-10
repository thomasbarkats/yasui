import { Inject, Logger, Middleware, Next, Req } from '..';
import { LoggerService } from '../services';
import { TestsService } from './tests.service';
import { IMiddleware } from '~types/interfaces';
import { NextFunction, Request } from 'express';


@Middleware()
export class HelloMiddleware implements IMiddleware {

    /** middlewares must have an unique use() method */
    use(
        @Req() req: Request,
        @Inject() testsService: TestsService, // injections can be at the controller/middleware method level
        @Logger() logger: LoggerService, // each request has a dedicated timed log instance
        @Next() next: NextFunction,
    ): void {
        const logSource: string = `${req.source} > ${HelloMiddleware.name}`;

        logger.log(`Request ${req.method} ${req.path} ...`, logSource);
        testsService.helloWorld(logSource);

        // Don't forget next() to continue on to the next middleware(s)!
        next();
    }
}
