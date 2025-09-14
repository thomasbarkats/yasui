import { Inject, Logger, Middleware, Req, LoggerService, IMiddleware, Request } from 'yasui';
import { TestsService } from './tests.service.js';


@Middleware()
export class HelloMiddleware implements IMiddleware {

  /** middlewares must have an unique use() method */
  use(
    @Req() req: Request,
    @Inject() testsService: TestsService,
    @Logger() logger: LoggerService, // each request has a dedicated timed log instance
  ): void {
    logger.log(`Request ${req.method} ${req.path} ...`, HelloMiddleware.name);
    testsService.helloWorld(HelloMiddleware.name);
  }
}
