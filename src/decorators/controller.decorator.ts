/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import express from 'express';
import { set, forEach, toUpper } from 'lodash';
import chalk from 'chalk';
import { timeLogger } from '../services';
import { IControllerRoute } from '../utils/controller-route.model';


export function Controller(
    path: string,
    ...middlewares: any[]
): ClassDecorator {
    return function (constructor: Function): void {
        // define path property of controller object
        constructor.prototype.path = path;

        constructor.prototype.configureRoutes = (debug = false): express.Router => {
            const router: express.Router = express.Router();

            // enrich query with controller infos for logs and errors handling
            router.use((req, res, next) => {
                set(req, 'source', constructor.name);
                set(req, 'logger', timeLogger.start());
                next();
            });

            // use other optional middlewares for all controller routes
            forEach(middlewares, middleware => {
                router.use(middleware);
            });

            // add routes from object metadata
            const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', constructor.prototype);
            const timelog = new timeLogger();
            forEach(routes, route => {
                debug && timelog.debug(
                    `stack route ${chalk.italic(`${toUpper(route.method)} ${route.path}`)}`,
                    constructor.name
                );
                const middlewares = route.middlewares || [];
                router[route.method](route.path, ...middlewares, route.function);
            });

            return router;
        };
    };
}
