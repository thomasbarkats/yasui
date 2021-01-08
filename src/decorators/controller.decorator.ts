import { RequestHandler, Router } from 'express';
import chalk from 'chalk';
import { timeLogger } from '../services';
import { IControllerRoute } from '../utils/controller-route.model';


export function Controller(
    path: string,
    ...middlewares: RequestHandler[]
): ClassDecorator {
    // eslint-disable-next-line @typescript-eslint/ban-types
    return function (constructor: Function): void {
        // define path property of controller object
        constructor.prototype.path = path;

        constructor.prototype.configureRoutes = (debug = false): Router => {
            const router: Router = Router();

            /** enrich query with controller infos for logs and errors handling */
            router.use((req, res, next) => {
                req.source = constructor.name;
                req.logger = timeLogger.start();
                next();
            });

            /** use other optional middlewares for all controller routes */
            for (const middleware of middlewares) {
                router.use(middleware);
            }

            /** add routes from object metadata */
            const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', constructor.prototype) || [];
            const timelog = new timeLogger();

            for (const route of routes) {
                debug && timelog.debug(
                    `stack route ${chalk.italic(`${route.method.toUpperCase()} ${route.path}`)}`,
                    constructor.name
                );
                const middlewares = route.middlewares || [];
                router[route.method](route.path, ...middlewares, route.function);
            }

            return router;
        };
    };
}
