import * as http from 'http';
import express from 'express';
import { json } from 'body-parser';
import { blue, bold, italic, magenta } from 'kleur';
import { connect, connection } from 'mongoose';

import { BaseConfig, IDController, IDMiddleware } from './types/interfaces';
import { AppService } from './utils/app.service';
import { logger } from './services';


export function createServer(conf: BaseConfig): http.Server {
    console.clear();
    logger.log(bold(magenta('（◠‿◠）やすいです！')), magenta('yasui'));

    const envDefined = conf.environment !== undefined;
    envDefined && logger.log(blue(`run as ${conf.environment} environment`));

    const app: express.Application = createApp(conf);

    const server: http.Server = http.createServer(app);
    const port: number | string = conf.port || 3000;

    server.listen(port, () => {
        logger.success('server successfully started');
        logger.log(`server listens on port ${port}`);
    });
    return server;
}

export function createApp(conf: BaseConfig): express.Application {
    logger.start();
    const app: express.Application = express();
    app.use(json());

    /** client authentication */
    if (conf.apiKey) {
        const appMiddleware = new AppService(conf.apiKey);
        app.use(appMiddleware.auth.bind(appMiddleware));
    }

    /** logs for debugging */
    if (conf.debug) {
        logger.warn('debug mode is enabled');
        app.use(AppService.logRequest);
    }

    /** use other optional middlewares */
    for (const Middleware of conf.middlewares || []) {
        try {
            const middleware = new Middleware() as IDMiddleware;
            app.use(middleware.run(middleware));
        } catch(err) {
            logger.error(`failed to load ${Middleware.name || '<invalid function>'} middleware\n${err}`);
        }
    }

    logger.log('load routes from controllers...');
    for (const Controller of conf.controllers || []) {
        try {
            const controller = new Controller() as IDController;
            const path: string = controller.path;
            const router: express.Router = controller.configureRoutes(controller, conf.debug);
            app.use(path, router);
            logger.success(`${italic(`${path}`)} routes loaded`);

        } catch(err) {
            logger.error(`failed to load ${Controller.name || '<invalid controller>'} routes\n${err}`);
        }
    }

    app.get('/', (req: express.Request, res: express.Response) => res.sendStatus(200));
    app.use(AppService.handleNotFound);
    app.use(AppService.handleErrors);

    return app;
}

export function connectMongoDB(url: string): void {
    logger.start();
    logger.log('establishing database connection...');

    connect(
        url,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        },
    );
    const db = connection;
    db.on('error', () => logger.error('database connection: error'));
    db.once('open', () => logger.success('database connection: success'));
}
