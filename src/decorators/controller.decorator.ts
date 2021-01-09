import { RequestHandler, Router } from 'express';
import { italic } from 'kleur';

import { timeLogger } from '../services';
import { IControllerRoute } from '../types/interfaces';


export function Controller(
    path: string,
    ...middlewares: RequestHandler[]
): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (target: Function): void {
        target.prototype.path = path;

        target.prototype.configureRoutes = (debug = false): Router => {
            const router: Router = Router();

            /** enrich query with controller infos for logs and errors handling */
            router.use((req, res, next) => {
                req.source = target.name;
                req.logger = timeLogger.start();
                next();
            });

            /** use other optional middlewares for all controller routes */
            for (const middleware of middlewares) {
                router.use(middleware);
            }

            /** add routes from object metadata */
            const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target.prototype) || [];
            const timelog = new timeLogger();

            for (const route of routes) {
                debug && timelog.debug(
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
