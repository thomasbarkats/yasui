import kleur from 'kleur';
import { Router, RequestHandler } from 'express';
import { Core } from '../core.js';
import { routeHandler } from '../utils/route-handler.js';
import { ReflectMetadata, defineMetadata, getMetadata } from '../utils/reflect.js';
import { Constructible, IController, IPipeTransform, TMiddleware } from '../interfaces/index.js';


/** Define a Controller with optional middleware */
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
      defineMetadata(ReflectMetadata.SELF, self, target.prototype);

      /** use other optional middlewares for all controller routes */
      for (const Middleware of middlewares) {
        router.use(core.useMiddleware(Middleware));
      }

      /** add routes from object metadata */
      const routes = getMetadata(ReflectMetadata.ROUTES, target.prototype) || [];

      for (const route of routes) {
        if (core.config.debug) {
          core.logger.debug(
            `stack route ${kleur.italic(`${route.method.toUpperCase()} ${route.path}`)}`,
            target.name
          );
        }

        /** setup route and middlewares on controller router */

        const middlewares: RequestHandler[] = route.middlewares.map(
          (Middleware: TMiddleware) => core.useMiddleware(Middleware)
        );

        const pipes = [
          ...(core.config.globalPipes || []),
          ...(getMetadata(ReflectMetadata.PIPES, target.prototype) || []),
          ...(getMetadata(ReflectMetadata.PIPES, target.prototype, route.methodName) || [])
        ].map(
          (Pipe: Constructible<IPipeTransform>) => core.build(Pipe)
        );

        router[route.method](route.path, ...middlewares,
          routeHandler(target, route.descriptor, route.params, pipes, false, route.defaultStatus)
        );
      }
      return router;
    };
  };
}
