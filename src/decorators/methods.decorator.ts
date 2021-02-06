/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */

import express from 'express';
import { RouteMethods } from '../types/enums';
import { IController, IControllerRoute, IRouteParam, TMiddleware } from '../types/interfaces';


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
        const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target) || [];
        Reflect.defineMetadata(
            'ROUTES',
            [...routes, route],
            target
        );
    };
}


/** create express-route-handler from controller method */
export function routeHandler(
    target: Object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
): express.RequestHandler {
    const routeFunction: Function = descriptor.value;

    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void => {
        /** get params metadata of controller method */
        const KEY = String(propertyKey);
        const params: IRouteParam[] = Reflect.getMetadata(`${KEY}_PARAMS`, target) || [];
        const self: IController = Reflect.getMetadata('SELF', target);

        const routeHandlerArgs = {req, res, next} as any;

        /** redefine route function args with mapped params path */
        const args: any[] = [];
        for (const param of params) {
            args[param.index] = param.path.reduce((prev, curr) => prev && prev[curr] || null, routeHandlerArgs);
        }
        return routeFunction.apply(self, args);
    };
}


export const Get = routeDecorator(RouteMethods.GET);
export const Post = routeDecorator(RouteMethods.POST);
export const Put = routeDecorator(RouteMethods.PUT);
export const Delete = routeDecorator(RouteMethods.DELETE);
export const Patch = routeDecorator(RouteMethods.PATCH);
