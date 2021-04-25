/* eslint-disable @typescript-eslint/ban-types */

import { RequestHandler, Router } from 'express';
import { italic } from 'kleur';

import { Core } from '../core';
import { LoggerService } from '../services';
import { IController, IControllerRoute, IDMiddleware, TMiddleware } from '../types/interfaces';


export function Controller(
    path: string,
    ...middlewares: TMiddleware[]
): ClassDecorator {
    return function (target: Function): void {
        target.prototype.path = path;

        target.prototype.configureRoutes = (
            self: IController,
            core: Core
        ): Router => {
            core.logger.start();
            const router: Router = Router();

            /** add target instance metadata to bind his args in route function */
            Reflect.defineMetadata('SELF', self, target.prototype);

            /** enrich query with controller infos for logs and errors handling */
            router.use((req, res, next) => {
                req.source = target.name;
                req.logger = new LoggerService().start();
                next();
            });

            /** use other optional middlewares for all controller routes */
            for (const Middleware of middlewares) {
                const middleware = core.build(Middleware) as IDMiddleware;
                router.use(middleware.run(middleware));
            }

            /** add routes from object metadata */
            const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target.prototype) || [];

            for (const route of routes) {
                core.config.debug && core.logger.debug(
                    `stack route ${italic(`${route.method.toUpperCase()} ${route.path}`)}`,
                    target.name
                );

                /** stack route and middlewares on controller router */
                const middlewares: RequestHandler[] = route.middlewares.map((Middleware: TMiddleware) => {
                    const middleware = core.build(Middleware) as IDMiddleware;
                    return middleware.run(middleware);
                });
                router[route.method](route.path, ...middlewares, route.function);
            }
            return router;
        };
    };
}
