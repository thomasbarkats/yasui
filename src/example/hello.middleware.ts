import { Inject, Logger, Middleware, Req, LoggerService, IMiddleware, type Request } from 'yasui';
import { TestsService } from './tests.service.js';


@Middleware()
export class HelloMiddleware implements IMiddleware {

  /** middlewares must have an unique use() method */
  use(
    @Req() req: Request,
    @Inject() testsService: TestsService,
    @Logger() logger: LoggerService, // each request can have a dedicated timed log instance
  ): void {
    const url = new URL(req.url);
    logger.log(`Request ${req.method} ${url.pathname} ...`, HelloMiddleware.name);
    testsService.helloWorld(HelloMiddleware.name);
  }
}
