import * as http from 'http';
import express from 'express';
import { json } from 'body-parser';
import { blue, bold, italic, magenta } from 'kleur';
import { connect, connection } from 'mongoose';

import { BaseConfig, IController } from './types/interfaces';
import { AppMiddleware } from './utils/app.middleware';
import { logger } from './services';


export function createServer(conf: BaseConfig): http.Server {
    console.clear();
    logger.log(bold(magenta('（◠‿◠）やすいです！')), magenta('yasui'));

    const envDefined = conf.environment !== undefined;
    envDefined && logger.log(blue(`run as ${conf.environment} environment`));

    const app: express.Application = createApp(conf);

    const server: http.Server = http.createServer(app);
    const port: number = conf.port || 3000;

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
    const haveApiKey: boolean = conf.apiKey !== undefined;
    haveApiKey && app.use(new AppMiddleware(conf.apiKey).auth);

    /** logs for debugging */
    if (conf.debug) {
        logger.warn('debug mode is enabled');
        app.use(AppMiddleware.logRequest);
    }

    /** use other optional middlewares */
    for (const middleware of conf.middlewares || []) {
        try {
            app.use(middleware);
        } catch(err) {
            logger.error(`failed to load ${middleware.name || '<invalid function>'} middleware\n${err}`);
        }
    }

    logger.log('load routes from controllers...');
    for (const Controller of conf.controllers || []) {
        try {
            const prototype: IController = Controller.prototype as IController;
            const path: string = prototype.path;
            const router: express.Router = prototype.configureRoutes(conf.debug);
            app.use(path, router);
            logger.success(`${italic(`${path}`)} routes loaded`);

        } catch(err) {
            logger.error(`failed to load ${Controller.name || '<invalid controller>'} routes\n${err}`);
        }
    }

    app.get('/', (req: express.Request, res: express.Response) => res.sendStatus(200));
    app.use(AppMiddleware.handleNotFound);
    app.use(AppMiddleware.handleErrors);

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
