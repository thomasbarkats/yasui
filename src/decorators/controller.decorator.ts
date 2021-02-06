/* eslint-disable @typescript-eslint/ban-types */

import { RequestHandler, Router } from 'express';
import { italic } from 'kleur';

import { logger } from '../services';
import { LoggerService } from '../services/logger.service';
import { IController, IControllerRoute } from '../types/interfaces';


export function Controller(
    path: string,
    ...middlewares: Function[]
): ClassDecorator {
    return function (target: Function): void {
        target.prototype.path = path;

        target.prototype.configureRoutes = (
            self: IController,
            debug = false
        ): Router => {
            logger.start();
            const router: Router = Router();

            /** bind target impl to metadata to use this arg in route function */
            Reflect.defineMetadata('SELF', self, target.prototype);

            /** enrich query with controller infos for logs and errors handling */
            router.use((req, res, next) => {
                req.source = target.name;
                req.logger = new LoggerService().start();
                next();
            });

            /** use other optional middlewares for all controller routes */
            for (const middleware of middlewares) {
                router.use(middleware as RequestHandler);
            }

            /** add routes from object metadata */
            const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target.prototype) || [];

            for (const route of routes) {
                debug && logger.debug(
                    `stack route ${italic(`${route.method.toUpperCase()} ${route.path}`)}`,
                    target.name
                );

                /** stack route and middlewares on controller router */
                const middlewares = route.middlewares as RequestHandler[] || [];
                router[route.method](route.path, ...middlewares, route.function);
            }
            return router;
        };
    };
}
