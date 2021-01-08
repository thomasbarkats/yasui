import { RequestHandler } from 'express';
import { RouteMethods } from '../@types/enums';
import { IControllerRoute } from '../utils/controller-route.model';


/** set routes metadata for controller methods */
function addRoute(
    method: RouteMethods,
    path: string,
    ...middlewares: RequestHandler[]
): MethodDecorator {
    return function (
        // eslint-disable-next-line @typescript-eslint/ban-types
        target: Object,
        propertyKey: string | symbol,
        descriptor: PropertyDescriptor
    ): void {
        const route: IControllerRoute = {
            method,
            path,
            middlewares,
            function: descriptor.value,
        };
        const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target) as IControllerRoute[] || [];
        Reflect.defineMetadata('ROUTES', [...routes, route], target);
    };
}


export const Get = (path: string, ...middlewares: RequestHandler[]): MethodDecorator => addRoute(RouteMethods.GET, path, ...middlewares);
export const Post = (path: string, ...middlewares: RequestHandler[]): MethodDecorator => addRoute(RouteMethods.POST, path, ...middlewares);
export const Put = (path: string, ...middlewares: RequestHandler[]): MethodDecorator => addRoute(RouteMethods.PUT, path, ...middlewares);
export const Delete = (path: string, ...middlewares: RequestHandler[]): MethodDecorator => addRoute(RouteMethods.DELETE, path, ...middlewares);
export const Patch = (path: string, ...middlewares: RequestHandler[]): MethodDecorator => addRoute(RouteMethods.PATCH, path, ...middlewares);
