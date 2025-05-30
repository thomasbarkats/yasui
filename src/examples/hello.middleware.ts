import { Logger, Middleware, Req } from '..';
import { LoggerService } from '../services';
import { TestsService } from './tests.service';
import { IMiddleware } from '../types/interfaces';
import { Request } from 'express';


@Middleware()
export class HelloMiddleware implements IMiddleware {

    constructor(
        private readonly testsService: TestsService,
    ) { }


    /** middlewares must have an unique use() method */
    use(
        @Req() req: Request,
        @Logger() logger: LoggerService, // each request has a dedicated timed log instance
    ): void {
        const logSource: string = `${req.source} > ${HelloMiddleware.name}`;

        logger.log(`Request ${req.method} ${req.path} ...`, logSource);
        this.testsService.helloWorld(logSource);
    }
}
