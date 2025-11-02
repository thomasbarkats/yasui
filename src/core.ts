import kleur from 'kleur';
import { createRouter, RadixRouter } from 'radix3';

import { YasuiRequest, RequestHandler, NextFunction, FetchHandler } from './web.js';
import { Injector } from './injector.js';
import { LoggerService } from './services/index.js';
import { AppService } from './utils/app.service.js';
import { ConfigValidator } from './utils/config-validator.js';
import { DecoratorValidator } from './utils/decorator-validator.js';
import { SwaggerService } from './utils/swagger.service.js';
import { setupSwaggerUI } from './utils/swagger.js';
import { HttpCode } from './enums/index.js';
import {
  Constructible,
  IController,
  IDMiddleware,
  Instance,
  JsonValue,
  TMiddleware,
  YasuiConfig,
} from './interfaces/index.js';


interface IDController extends IController {
  path: string;
  configureRoutes: (self: this, core: Core) => void;
}

interface RouteData {
  handler: RequestHandler;
  middlewares: RequestHandler[];
  method: string;
  source?: string;
  defaultStatus?: HttpCode;
}


export class Core {
  public config: YasuiConfig;
  public logger: LoggerService;
  public swagger: SwaggerService;
  public decoratorValidator: DecoratorValidator | null;

  private appService: AppService;
  private injector: Injector;
  private router: RadixRouter<RouteData>;
  private globalMiddlewares: RequestHandler[] = [];

  constructor(conf: YasuiConfig) {
    ConfigValidator.validate(conf);

    this.config = conf;
    if (conf.enableDecoratorValidation === undefined) {
      this.config.enableDecoratorValidation = true;
    }
    this.logger = new LoggerService();
    this.appService = new AppService(this.config);
    this.decoratorValidator = this.config.enableDecoratorValidation
      ? new DecoratorValidator(this.config)
      : null;
    this.injector = new Injector(
      this.logger,
      this.decoratorValidator,
      conf.debug,
    );
    this.swagger = new SwaggerService(
      this.decoratorValidator,
    );
    this.router = createRouter<RouteData>();
  }


  public createApp(): FetchHandler {
    this.logger.start();

    /** register custom injections */
    for (const injection of this.config.injections || []) {
      this.injector.register(injection.token, injection.provide);
    }

    /** client authentication middleware */
    if (this.config.apiKey) {
      this.globalMiddlewares.push(this.appService.auth.bind(this.appService));
    }

    /** debug logging middleware */
    if (this.config.debug) {
      this.logger.warn('debug mode is enabled');
      this.globalMiddlewares.push(this.appService.logRequest.bind(this.appService));
    }

    /** load other optional middlewares */
    this.loadMiddlewares();

    this.logger.log('load routes from controllers...');
    this.loadControllers();

    /** setup swagger documentation if enabled */
    this.setupSwagger();

    /** add root health check route */
    this.addRoute('/', 'GET', () => new Response(null, { status: 200 }), []);

    /** create fetch handler */
    const handler = async (standardReq: Request): Promise<Response> => {
      try {
        const req = new YasuiRequest(standardReq);

        const routeKey = `${req.method}:${req.path}`;
        const match = this.router.lookup(routeKey);

        if (!match) {
          return this.appService.handleNotFound(req);
        }
        req.params = match.params || {};
        req.logger = new LoggerService().start();
        req.source = match.source;

        return await this.executeChain(req, match);

      } catch (error) {
        // minimal request for error handling if conversion failed
        const req = new YasuiRequest(standardReq.url, {
          method: standardReq.method,
          headers: standardReq.headers,
        });
        req.logger = new LoggerService().start();
        return this.appService.handleErrors(<Error>error, req);
      }
    };

    return { fetch: handler };
  }

  public build<T extends Instance>(Provided: Constructible<T>): T {
    return this.injector.build(Provided);
  }

  public useMiddleware(Middleware: TMiddleware): RequestHandler {
    if (this.isClassMiddleware(Middleware)) {
      const middleware = this.build(Middleware) as IDMiddleware;
      return middleware.run(middleware);
    }
    return <RequestHandler>Middleware;
  }

  public addRoute(
    path: string,
    method: string,
    handler: RequestHandler,
    middlewares: RequestHandler[],
    source?: string,
    defaultStatus?: HttpCode
  ): void {
    const routeKey = `${method.toUpperCase()}:${path}`;
    this.router.insert(routeKey, {
      handler,
      middlewares: [...this.globalMiddlewares, ...middlewares],
      method: method.toUpperCase(),
      source,
      defaultStatus,
    });
  }


  private convertToResponse(result: Response | JsonValue | void, defaultStatus?: HttpCode): Response {
    if (result instanceof globalThis.Response) {
      return result;
    }
    if (result === undefined || result === null) {
      return new Response(null, { status: 204 });
    }
    const status = defaultStatus || HttpCode.OK;
    return Response.json(result, { status });
  }

  private async executeChain(
    req: YasuiRequest,
    routeData: RouteData & { params?: Record<string, unknown> }
  ): Promise<Response> {
    const allMiddlewares = routeData.middlewares || [];
    let index = 0;

    const next: NextFunction = async (): Promise<Response> => {
      if (index < allMiddlewares.length) {
        const middleware = allMiddlewares[index++];
        const result = await middleware(req, next);
        return this.convertToResponse(result);
      }
      const result = await routeData.handler(req);
      return this.convertToResponse(result, routeData.defaultStatus);
    };

    try {
      return await next();
    } catch (error) {
      return this.appService.handleErrors(<Error>error, req);
    }
  }

  private loadMiddlewares(): void {
    for (const Middleware of this.config.middlewares || []) {
      try {
        this.globalMiddlewares.push(this.useMiddleware(Middleware));
      } catch (err) {
        this.logger.error(`failed to load ${Middleware.name || '<invalid function>'} middleware\n${err}`);
      }
    }
  }

  private loadControllers(): void {
    for (const Controller of this.config.controllers || []) {
      try {
        this.decoratorValidator?.validateController(Controller);

        const controller = this.build(Controller) as IDController;
        const path: string = controller.path;
        controller.configureRoutes(controller, this);

        if (this.config.swagger?.generate) {
          this.swagger.registerControllerRoutes(Controller, path);
        }

        this.logger.success(`${kleur.italic(`${path}`)} routes loaded`);

      } catch (err) {
        this.logger.error(`failed to load ${Controller.name || '<invalid controller>'} routes\n${err}`);
      }
    }
  }

  private setupSwagger(): void {
    if (!this.config.swagger?.generate) {
      return;
    }
    const swaggerPath = this.config.swagger.path || '/api-docs';
    const swaggerConfig = this.swagger.getSwaggerConfig(this.config.swagger, !!this.config.apiKey);

    setupSwaggerUI(
      this.addRoute.bind(this),
      swaggerConfig,
      swaggerPath,
      this.logger,
      !!this.config.debug
    );
  }


  private isClassMiddleware(Md: TMiddleware): Md is Constructible<IDMiddleware> {
    if (typeof Md !== 'function') {
      return false;
    }
    return Md.prototype &&
      typeof Md.prototype.run === 'function' &&
      Md.prototype.constructor === Md;
  }
}
