import { ReflectMetadata, getMetadata, defineMetadata } from '../utils/reflect.js';
import { HttpCode, RouteMethods } from '../enums/index.js';
import { IControllerRoute, TMiddleware } from '../interfaces/index.js';


type RouteDecorator = (
  path: string,
  ...middlewares: TMiddleware[]
) => MethodDecorator;

/** create express method-routing decorator */
function routeDecorator(method: RouteMethods): RouteDecorator {
  return function (
    path: string,
    ...middlewares: TMiddleware[]
  ): MethodDecorator {
    return addRoute(method, path, ...middlewares);
  };
}

/** set routes metadata for controller methods */
function addRoute(
  method: RouteMethods,
  path: string,
  ...middlewares: TMiddleware[]
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ): void {
    const methodName: string = String(propertyKey);
    const defaultStatus = getMetadata(ReflectMetadata.HTTP_STATUS, target, propertyKey) || HttpCode.OK;
    const params = getMetadata(ReflectMetadata.PARAMS, target, methodName) || [];

    const route: IControllerRoute = {
      method,
      path,
      middlewares,
      descriptor,
      methodName,
      defaultStatus,
      params,
    };

    const routes = getMetadata(ReflectMetadata.ROUTES, target) || [];
    defineMetadata(ReflectMetadata.ROUTES, [...routes, route], target);
  };
}


/** Define a GET endpoint with optional middleware */
export const Get: RouteDecorator = routeDecorator(RouteMethods.GET);
/** Define a POST endpoint with optional middleware */
export const Post: RouteDecorator = routeDecorator(RouteMethods.POST);
/** Define a PUT endpoint with optional middleware */
export const Put: RouteDecorator = routeDecorator(RouteMethods.PUT);
/** Define a DELETE endpoint with optional middleware */
export const Delete: RouteDecorator = routeDecorator(RouteMethods.DELETE);
/** Define a PATCH endpoint with optional middleware */
export const Patch: RouteDecorator = routeDecorator(RouteMethods.PATCH);
