/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import { RouteMethods } from '../enums';
import { IControllerRoute } from '../utils/controller-route.model';


// set routes metadata for controller methods
function addRoute(
    method: RouteMethods,
    path: string,
    ...middlewares: any[]
): MethodDecorator {
    return function (
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


export const Get = (path: string, ...middlewares: any[]): MethodDecorator => addRoute(RouteMethods.GET, path, ...middlewares);
export const Post = (path: string, ...middlewares: any[]): MethodDecorator => addRoute(RouteMethods.POST, path, ...middlewares);
export const Put = (path: string, ...middlewares: any[]): MethodDecorator => addRoute(RouteMethods.PUT, path, ...middlewares);
export const Delete = (path: string, ...middlewares: any[]): MethodDecorator => addRoute(RouteMethods.DELETE, path, ...middlewares);
export const Patch = (path: string, ...middlewares: any[]): MethodDecorator => addRoute(RouteMethods.PATCH, path, ...middlewares);
