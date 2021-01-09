import { RequestHandler, Router } from 'express';
import { italic } from 'kleur';

import { logger } from '../services';
import { LoggerService } from '../services/logger.service';
import { IControllerRoute } from '../types/interfaces';


export function Controller(
    path: string,
    ...middlewares: RequestHandler[]
): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target: Function): void {
        target.prototype.path = path;

        target.prototype.configureRoutes = (debug = false): Router => {
            logger.start();
            const router: Router = Router();

            /** enrich query with controller infos for logs and errors handling */
            router.use((req, res, next) => {
                req.source = target.name;
                req.logger = new LoggerService().start();
                next();
            });

            /** use other optional middlewares for all controller routes */
            for (const middleware of middlewares) {
                router.use(middleware);
            }

            /** add routes from object metadata */
            const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target.prototype) || [];

            for (const route of routes) {
                debug && logger.debug(
                    `stack route ${italic(`${route.method.toUpperCase()} ${route.path}`)}`,
                    target.name
                );
                const middlewares = route.middlewares || [];
                router[route.method](route.path, ...middlewares, route.function);
            }

            return router;
        };
    };
}
