import { getMetadata, defineMetadata } from '../utils/reflect.js';
import { HttpCode, ReflectMetadata, RouteMethods } from '~types/enums';
import { IControllerRoute, TMiddleware } from '~types/interfaces';


/** create express method-routing decorator */
function routeDecorator(method: RouteMethods): Function {
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


export const Get = routeDecorator(RouteMethods.GET);
export const Post = routeDecorator(RouteMethods.POST);
export const Put = routeDecorator(RouteMethods.PUT);
export const Delete = routeDecorator(RouteMethods.DELETE);
export const Patch = routeDecorator(RouteMethods.PATCH);
