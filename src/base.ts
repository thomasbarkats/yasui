import * as http from 'http';
import express from 'express';
import { json } from 'body-parser';
import { blue, bold, italic, magenta } from 'kleur';
import { connect, connection } from 'mongoose';

import { BaseConfig } from './types/interfaces';
import { AppMiddleware } from './utils/app.middleware';
import { logger, timeLogger } from './services';


export function createServer(conf: BaseConfig): http.Server {
    conf.debug && console.clear();
    logger.log(bold(magenta('（◠‿◠）やすいです！')), magenta('yasui'));

    const envDefined = conf.environment !== undefined;
    envDefined && logger.log(blue(`run as ${conf.environment} environment`));

    const app: express.Application = createApp(conf);
    const timelog = timeLogger.start();

    const server: http.Server = http.createServer(app);
    const port: number = conf.port || 3000;
    conf.debug && timelog.debug(`server listens on port ${port}`);

    server.listen(port, () => timelog.success('server successfully started'));
    return server;
}

export function createApp(conf: BaseConfig): express.Application {
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

    const timelog = timeLogger.start();

    /** use other optional middlewares */
    for (const middleware of conf.middlewares || []) {
        try {
            app.use(middleware);
        } catch(err) {
            timelog.error(`failed to load ${middleware.name || '<invalid function>'} middleware\n${err}`);
        }
    }

    timelog.log('load routes from controllers...');
    for (const Controller of conf.controllers || []) {
        try {
            const path: string = Controller.prototype.path || '/';
            const router: express.Router = Controller.prototype.configureRoutes(conf.debug);
            app.use(path, router);

            timelog.success(
                `${italic(`${path}`)} routes loaded`,
                Controller.name
            );
        } catch(err) {
            timelog.error(`failed to load ${Controller.name || '<invalid controller>'} routes\n${err}`);
        }
    }

    app.get('/', (req: express.Request, res: express.Response) => res.sendStatus(200));
    app.use(AppMiddleware.handleNotFound);
    app.use(AppMiddleware.handleErrors);

    return app;
}

export function connectMongoDB(url: string): void {
    logger.log('establishing database connection...');
    const timelog = timeLogger.start();

    connect(
        url,
        {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        },
    );
    const db = connection;
    db.on('error', () => timelog.error('database connection: error'));
    db.once('open', () => timelog.success('database connection: success'));
}
