import kleur from 'kleur';
import { RequestHandler } from '../web.js';
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
    ): void => {
      core.logger.start();

      /** add target instance metadata to bind his args in route function */
      defineMetadata(ReflectMetadata.SELF, self, target.prototype);

      /** prepare controller-level middlewares */
      const controllerMiddlewares: RequestHandler[] = middlewares.map(
        (Middleware: TMiddleware) => core.useMiddleware(Middleware)
      );

      /** add routes from object metadata */
      const routes = getMetadata(ReflectMetadata.ROUTES, target.prototype) || [];

      /** get controller-level pipes once (same for all routes) */
      const controllerPipes = getMetadata(ReflectMetadata.PIPES, target.prototype) || [];

      for (const route of routes) {
        if (core.config.debug) {
          core.logger.debug(
            `stack route ${kleur.italic(`${route.method.toUpperCase()} ${route.path}`)}`,
            target.name
          );
        }

        /** prepare route-specific middlewares */
        const routeMiddlewares: RequestHandler[] = route.middlewares.map(
          (Middleware: TMiddleware) => core.useMiddleware(Middleware)
        );

        /** combine controller and route middlewares */
        const allMiddlewares = [...controllerMiddlewares, ...routeMiddlewares];

        /** prepare pipes (global, controller, route) */
        const pipes = [
          ...(core.config.globalPipes || []),
          ...controllerPipes,
          ...(getMetadata(ReflectMetadata.PIPES, target.prototype, route.methodName) || [])
        ].map(
          (Pipe: Constructible<IPipeTransform>) => core.build(Pipe)
        );

        /** create route handler */
        const handler = routeHandler(
          target,
          route.descriptor,
          route.params,
          pipes,
          false,
          core.config.strictValidation,
          core.config.maxBodySize
        );

        /** join controller path with route path */
        const fullPath = joinPaths(path, route.path);

        /** detect if route use logger decorator */
        const routeUseLogger = route.params.some(p => p.path.includes('_logger'));
        const allMiddlewareClasses = [...middlewares, ...route.middlewares];
        const middlewaresUseLogger = allMiddlewareClasses.some(Md => core.middlewareUseLogger(Md));
        const useLogger = routeUseLogger || middlewaresUseLogger;

        /** register route with radix3 in core */
        core.addRoute(
          fullPath,
          route.method,
          handler,
          allMiddlewares,
          target.name,
          route.defaultStatus,
          useLogger
        );
      }
    };
  };
}

function joinPaths(base: string, path: string): string {
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : '/' + path;

  if (normalizedBase === '' && normalizedPath === '/') {
    return '/';
  }
  if (normalizedBase === '') {
    return normalizedPath;
  }
  if (normalizedPath === '/') {
    return normalizedBase;
  }
  return normalizedBase + normalizedPath;
}
