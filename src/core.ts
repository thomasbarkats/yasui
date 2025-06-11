import express, {
  Application,
  Request,
  RequestHandler,
  Response,
  Router,
} from 'express';
import { json } from 'body-parser';
import { italic } from 'kleur';

import { Constructible, IController, IDMiddleware, Instance, TMiddleware } from '~types/interfaces';
import { YasuiConfig } from '~types/interfaces';
import { AppService } from './utils/app.service';
import { DecoratorValidator } from './utils/decorator-validator';
import { LoggerService } from './services';
import { Injector } from './injector';
import { SwaggerService } from './utils/swagger.service';


interface IDController extends IController {
    path: string;
    configureRoutes: (self: this, core: Core) => Router;
}


export class Core {
  public config: YasuiConfig;
  public logger: LoggerService;
  public swagger: SwaggerService;
  public decoratorValidator: DecoratorValidator | null;

  private appService: AppService;
  private injector: Injector;
  private app: Application;

  constructor(conf: YasuiConfig) {
    this.config = conf;
    if (conf.enableDecoratorValidation === undefined) {
      this.config.enableDecoratorValidation = true;
    }
    this.logger = new LoggerService();
    this.appService = new AppService(this.config);
    this.swagger = new SwaggerService();
    this.decoratorValidator = this.config.enableDecoratorValidation
      ? new DecoratorValidator(this.config)
      : null;
    this.injector = new Injector(
      this.logger,
      this.decoratorValidator,
      conf.debug,
    );
    this.app = express();
  }


  public createApp(): Application {
    this.logger.start();
    this.app.use(json());

    /** client authentication */
    if (this.config.apiKey) {
      this.app.use(this.appService.auth.bind(this.appService));
    }

    /** logs for debugging */
    if (this.config.debug) {
      this.logger.warn('debug mode is enabled');
      this.app.use(this.appService.logRequest.bind(this.appService));
    }

    /** register custom injections */
    for (const injection of this.config.injections || []) {
      this.injector.register(injection.token, injection.provide);
    }

    /** use other optional middlewares */
    this.loadMiddlewares();

    this.logger.log('load routes from controllers...');
    this.loadControllers();

    /** setup swagger documentation if enabled */
    this.setupSwagger();

    this.app.get('/', (req: Request, res: Response) => { res.sendStatus(200); });
    this.app.use(this.appService.handleNotFound.bind(this.appService));
    this.app.use(this.appService.handleErrors.bind(this.appService));

    return this.app;
  }

  public build<T extends Instance>(Provided: Constructible<T>): T {
    return this.injector.build(Provided);
  }

  public useMiddleware(Middleware: TMiddleware): RequestHandler {
    if (DecoratorValidator.isConstructible(Middleware)) {
      const middleware = this.build(<Constructible>Middleware) as IDMiddleware;
      return middleware.run(middleware);
    }
    return <RequestHandler>Middleware;
  }


  private loadMiddlewares(): void {
    for (const Middleware of this.config.middlewares || []) {
      try {
        this.app.use(this.useMiddleware(Middleware));
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
        const router: Router = controller.configureRoutes(controller, this);
        this.app.use(path, router);

        if (this.config.swagger?.generate) {
          this.swagger.registerControllerRoutes(Controller, path);
        }

        this.logger.success(`${italic(`${path}`)} routes loaded`);

      } catch (err) {
        this.logger.error(`failed to load ${Controller.name || '<invalid controller>'} routes\n${err}`);
      }
    }
  }

  private setupSwagger(): void {
    if (!this.config.swagger?.generate) {
      return;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const swaggerUi = require('swagger-ui-express');
      let swaggerPath = this.config.swagger.path || '/api-docs';
      if (!swaggerPath.startsWith('/')) {
        swaggerPath = '/' + swaggerPath;
      }
      const swaggerConfig = this.swagger.getSwaggerConfig(this.config.swagger?.info, !!this.config.apiKey);

      this.app.use(swaggerPath, swaggerUi.serve);
      this.app.get(swaggerPath, swaggerUi.setup(swaggerConfig));
      this.app.get(`${swaggerPath}/swagger.json`, (req, res) => {
        res.json(swaggerConfig);
      });

      this.logger.success(`${italic(`${swaggerPath}`)} swagger documentation loaded`);

    } catch (err) {
      this.logger.warn(
        'swagger-ui-express not found.\n' +
                'Install it to enable swagger documentation: npm install swagger-ui-express.'
      );
      if (this.config.debug) {
        this.logger.error(`swagger setup error: ${err}`);
      }
    }
  }
}
