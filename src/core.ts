import express from 'express';
import { json } from 'body-parser';
import { italic } from 'kleur';

import { ClassInstance, Constructible, IDController, IDMiddleware } from './types/interfaces';
import { AppService } from './utils/app.service';
import { LoggerService } from './services';
import { BaseConfig } from './types/interfaces';
import { Injector } from './injector';


export class Core {
    public config: BaseConfig;
    public logger: LoggerService;

    private injector: Injector;
    private app: express.Application;

    constructor(conf: BaseConfig) {
        this.config = conf;
        this.logger = new LoggerService();
        this.injector = new Injector(conf.debug, this.logger);
        this.app = express();
    }


    public createApp(): express.Application {
        this.logger.start();
        this.app.use(json());

        const appService = new AppService(this.config.apiKey);

        /** client authentication */
        if (this.config.apiKey) {
            this.app.use(appService.auth.bind(appService));
        }

        /** logs for debugging */
        if (this.config.debug) {
            this.logger.warn('debug mode is enabled');
            this.app.use(appService.logRequest.bind(appService));
        }

        /** use other optional middlewares */
        this.loadMiddlewares();

        this.logger.log('load routes from controllers...');
        this.loadControllers();

        this.app.get('/', (req: express.Request, res: express.Response) => res.sendStatus(200));
        this.app.use(appService.handleNotFound.bind(appService));
        this.app.use(appService.handleErrors.bind(appService));

        return this.app;
    }

    public build<T>(Provided: Constructible<T>): T | ClassInstance {
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
