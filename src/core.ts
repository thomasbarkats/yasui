import kleur from 'kleur';
import { createRouter, RadixRouter } from 'radix3';

import { YasuiRequest, RequestHandler, NextFunction, FetchHandler } from './web.js';
import { Injector } from './injector.js';
import { LoggerService } from './utils/index.js';
import { AppService } from './utils/app.service.js';
import { ConfigValidator } from './utils/config-validator.js';
import { DecoratorValidator } from './utils/decorator-validator.js';
import { SwaggerService } from './utils/swagger.service.js';
import { setupSwaggerUI } from './utils/swagger.js';
import { ReflectMetadata, getMetadata } from './utils/reflect.js';
import { HttpCode } from './enums/index.js';
import { HttpError } from './utils/error.resource.js';
import {
  Constructible,
  IController,
  IDMiddleware,
  Instance,
  JsonValue,
  TMiddleware,
  YasuiConfig,
} from './interfaces/index.js';


type CoreYasuiRequest = YasuiRequest & { _logger?: LoggerService; };

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
  useLogger?: boolean;
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
  private middlewareLoggerCache: WeakMap<Function, boolean> = new WeakMap();

  constructor(conf: YasuiConfig) {
    ConfigValidator.validate(conf);

    const defaultConfig: Partial<YasuiConfig> = {
      enableDecoratorValidation: true,
      maxBodySize: 10485760,
      maxHeaderSize: 16384,
      requestTimeout: 30000
    };

    this.config = { ...defaultConfig, ...conf };
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


  public async createApp(): Promise<FetchHandler> {
    this.logger.start();

    /** debug logging middleware */
    if (this.config.debug) {
      this.logger.warn('debug mode is enabled');
      this.globalMiddlewares.push(this.appService.logRequest.bind(this.appService));
    }

    /** client authentication middleware */
    if (this.config.apiKey) {
      this.globalMiddlewares.push(this.appService.auth.bind(this.appService));
    }

    /** warn if compression is enabled but CompressionStream is unavailable */
    if (this.config.compression && typeof CompressionStream === 'undefined') {
      // eslint-disable-next-line max-len
      this.logger.warn('compression is enabled but CompressionStream API is unavailable (requires Node.js 18+, Deno, or Bun)');
    }

    /** register custom injections */
    await this.registerInjections();

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
        const req: CoreYasuiRequest = new YasuiRequest(standardReq);

        /** check header size limit */
        if (this.config.maxHeaderSize) {
          let totalHeaderSize = 0;
          standardReq.headers.forEach((value, key) => {
            totalHeaderSize += key.length + value.length + 4; // +4 for ": " and "\r\n"
          });
          if (totalHeaderSize > this.config.maxHeaderSize) {
            throw new HttpError(
              HttpCode.REQUEST_ENTITY_TOO_LARGE,
              `Request headers size (${totalHeaderSize} bytes) exceeds maximum allowed size (${this.config.maxHeaderSize} bytes)`
            );
          }
        }

        const routeKey = `${req.method}:${req.path}`;
        const match = this.router.lookup(routeKey);

        if (!match) {
          /** execute global middlewares even without a route
           *  this allows CORS and other global middlewares to apply to all responses */
          if (req.method === 'OPTIONS' && this.globalMiddlewares.length > 0) {
            return await this.executeChain(req, {
              handler: () => new Response(null, { status: 204 }),
              middlewares: this.globalMiddlewares,
              method: req.method
            });
          }
          return this.appService.handleNotFound(req);
        }

        req.params = match.params || {};
        req.source = match.source;
        if (match.useLogger) {
          req._logger = new LoggerService().start();
        }

        /** apply request timeout if configured */
        if (this.config.requestTimeout) {
          const timeoutPromise = new Promise<Response>((_, reject) => {
            setTimeout(() => {
              reject(new HttpError(
                HttpCode.REQUEST_TIMEOUT,
                `Request exceeded timeout of ${this.config.requestTimeout}ms`
              ));
            }, this.config.requestTimeout);
          });

          return await Promise.race([
            this.executeChain(req, match),
            timeoutPromise
          ]);
        }

        return await this.executeChain(req, match);

      } catch (error) {
        // minimal request for error handling if conversion failed
        const req: CoreYasuiRequest = new YasuiRequest(standardReq.url, {
          method: standardReq.method,
          headers: standardReq.headers,
        });
        req._logger = new LoggerService().start();
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
      return middleware.run(middleware, this.config.strictValidation, this.config.maxBodySize);
    }
    return <RequestHandler>Middleware;
  }

  public addRoute(
    path: string,
    method: string,
    handler: RequestHandler,
    middlewares: RequestHandler[],
    source?: string,
    defaultStatus?: HttpCode,
    logger?: boolean
  ): void {
    const routeKey = `${method.toUpperCase()}:${path}`;
    this.router.insert(routeKey, {
      handler,
      middlewares: [...this.globalMiddlewares, ...middlewares],
      method: method.toUpperCase(),
      source,
      defaultStatus,
      useLogger: logger,
    });
  }

  /** check if middleware use logger with caching for performance */
  public middlewareUseLogger(Md: TMiddleware): boolean {
    if (typeof Md !== 'function' || !Md.prototype) {
      return false;
    }
    if (this.middlewareLoggerCache.has(Md)) {
      return this.middlewareLoggerCache.get(Md)!;
    }
    const need = getMetadata(ReflectMetadata.USE_LOGGER, Md.prototype) || false;
    this.middlewareLoggerCache.set(Md, need);
    return need;
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

  private compressResponse(response: Response, req: YasuiRequest): Response {
    if (!this.config.compression || !response.body || response.status === 204 || response.status === 304) {
      return response;
    }

    // Check if CompressionStream is available (Node.js 18+, Deno, Bun)
    if (typeof CompressionStream === 'undefined') {
      return response;
    }

    const acceptEncoding = req.rawHeaders.get('accept-encoding') || '';
    if (!acceptEncoding.includes('gzip')) {
      return response;
    }

    const contentType = response.headers.get('content-type') || '';
    // only compress text-based content types
    if (!/^(text\/|application\/(json|javascript|xml|.*\+xml))/.test(contentType)) {
      return response;
    }

    const headers = new Headers(response.headers);
    headers.set('content-encoding', 'gzip');
    headers.delete('content-length');

    return new Response(
      response.body.pipeThrough(new CompressionStream('gzip')),
      { status: response.status, statusText: response.statusText, headers }
    );
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
      const response = await next();
      return this.compressResponse(response, req);
    } catch (error) {
      return this.appService.handleErrors(<Error>error, req);
    }
  }

  private async registerInjections(): Promise<void> {
    for (const injection of this.config.injections || []) {
      if ('factory' in injection) {
        if (injection.deferred) {
          this.injector.deferred(injection.token, injection.factory);
        } else {
          const instance = await injection.factory();
          this.injector.register(injection.token, instance);
        }
      } else {
        this.injector.register(injection.token, injection.provide);
      }
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
      this.config.swagger.cdn
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
