import express from 'express';
import { json } from 'body-parser';
import { italic } from 'kleur';

import { Instance, Constructible, IDController, IDMiddleware } from './types/interfaces';
import { AppService } from './utils/app.service';
import { DecoratorValidator } from './utils/decorator-validator';
import { LoggerService } from './services';
import { CoreConfig } from './types/interfaces';
import { Injector } from './injector';


export class Core {
    public config: CoreConfig;
    public logger: LoggerService;
    public decoratorValidator: DecoratorValidator | null;

    private appService: AppService;
    private injector: Injector;
    private app: express.Application;

    constructor(conf: CoreConfig) {
        this.config = conf;
        if (conf.enableDecoratorValidation === undefined) {
            this.config.enableDecoratorValidation = true;
        }
        this.logger = new LoggerService();
        this.appService = new AppService(this.config.apiKey);
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


    public createApp(): express.Application {
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

        this.app.get('/', (req: express.Request, res: express.Response) => { res.sendStatus(200); });
        this.app.use(this.appService.handleNotFound.bind(this.appService));
        this.app.use(this.appService.handleErrors.bind(this.appService));

        return this.app;
    }

    public build<T extends Instance>(Provided: Constructible<T>): T {
        return this.injector.build(Provided);
    }


    private loadMiddlewares(): void {
        for (const Middleware of this.config.middlewares || []) {
            try {
                const middleware = this.build(Middleware) as IDMiddleware;
                this.app.use(middleware.run(middleware));

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
                const router: express.Router = controller.configureRoutes(controller, this);
                this.app.use(path, router);

                this.logger.success(`${italic(`${path}`)} routes loaded`);

            } catch (err) {
                this.logger.error(`failed to load ${Controller.name || '<invalid controller>'} routes\n${err}`);
            }
        }
    }
}
