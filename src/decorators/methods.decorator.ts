/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import express, { RequestHandler } from 'express';
import { RouteMethods } from '../types/enums';
import { IControllerRoute, IRouteParam } from '../types/interfaces';


/** create express method-routing decorator */
function routeDecorator(method: RouteMethods): Function {
    return function (
        path: string,
        ...middlewares: RequestHandler[]
    ): MethodDecorator {
        return addRoute(method, path, ...middlewares);
    };
}

/** set routes metadata for controller methods */
function addRoute(
    method: RouteMethods,
    path: string,
    ...middlewares: RequestHandler[]
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
            function: routeHandler(target, propertyKey, descriptor),
        };
        const routes = Reflect.getMetadata('ROUTES', target) as IControllerRoute[] || [];
        Reflect.defineMetadata(
            'ROUTES',
            [...routes, route],
            target
        );
    };
}


/** create express-route-handler from controller method */
function routeHandler(
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
): RequestHandler {
    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void => {
        /** get params metadata of controller method */
        const KEY = String(propertyKey);
        const params = Reflect.getMetadata(`${KEY}_PARAMS`, target) as IRouteParam[] || [];

        const routeFunction = descriptor.value;
        const routeHandlerArgs = {req, res, next} as any;

        /** redefine route function args with mapped params path */
        const args: any[] = [];
        for (const param of params) {
            args[param.index] = param.path.reduce((p, c) => p && p[c] || null, routeHandlerArgs);
        }
        return routeFunction.apply(routeFunction, args);
    };
}


export const Get = routeDecorator(RouteMethods.GET);
export const Post = routeDecorator(RouteMethods.POST);
export const Put = routeDecorator(RouteMethods.PUT);
export const Delete = routeDecorator(RouteMethods.DELETE);
export const Patch = routeDecorator(RouteMethods.PATCH);
