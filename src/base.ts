/* eslint-disable @typescript-eslint/no-explicit-any */

import * as http from 'http';
import express from 'express';
import { json } from 'body-parser';
import chalk from 'chalk';
import { forEach, get } from 'lodash';
import { connect, connection } from 'mongoose';

import { AppMiddleware } from './utils/app.middleware';
import { logger, timeLogger } from './services';


export interface YasuiConfig {
    controllers?: any[],
    middlewares?: any[],
    environment?: string;
    port?: number;
    debug?: boolean,
    apiKey?: string,
}

export function createServer(conf: YasuiConfig): http.Server {
    // eslint-disable-next-line no-console
    conf.debug && console.clear();
    const envDefined = conf.environment !== undefined;
    envDefined && logger.log(chalk.blue(`run as ${conf.environment} environment`));

    const app: express.Application = createApp(conf);
    const timelog = timeLogger.start();

    const server: http.Server = http.createServer(app);
    const port: number = conf.port || 3000;
    conf.debug && timelog.debug(`server listens on port ${port}`);

    server.listen(port, () => timelog.success('server successfully started'));
    return server;
}

export function createApp(conf: YasuiConfig): express.Application {
    const app: express.Application = express();
    app.use(json());

    // client authentication
    const haveApiKey: boolean = conf.apiKey !== undefined;
    haveApiKey && app.use(new AppMiddleware(conf.apiKey).auth);

    // logs for debugging
    if (conf.debug) {
        logger.warn('debug mode is enabled');
        app.use(AppMiddleware.logRequest);
    }

    const timelog = timeLogger.start();

    // use other optional middlewares
    forEach(conf.middlewares, middleware => {
        try {
            app.use(middleware);
        } catch(err) {
            timelog.error(`failed to load ${get(middleware, 'name', '<invalid function>')} middleware\n${err}`);
        }
    });

    timelog.log('load routes from controllers...');
    forEach(conf.controllers, (Controller: any) => {
        try {
            const controller: any = new Controller();
            const path: string = get(controller, 'path', '/');
            const router: express.Router = controller.configureRoutes(conf.debug);
            app.use(path, router);

            timelog.success(
                `${chalk.italic(`${path}`)} routes loaded`,
                get(Controller, 'name')
            );
        } catch(err) {
            timelog.error(`failed to load ${get(Controller, 'name', '<invalid controller>')} routes\n${err}`);
        }
    });


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
