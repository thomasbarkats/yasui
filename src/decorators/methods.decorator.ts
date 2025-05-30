import express from 'express';

import { HttpCode, RouteMethods } from '../types/enums';
import { IControllerRoute, Instance, IRouteParam, TMiddleware } from '../types/interfaces';


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
        const route: IControllerRoute = {
            method,
            path,
            middlewares,
            function: routeHandler(target, propertyKey, descriptor),
            methodName: String(propertyKey)
        };
        const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target) || [];
        Reflect.defineMetadata(
            'ROUTES',
            [...routes, route],
            target
        );
    };
}


/** create express-route-handler from controller/middleware method */
export function routeHandler(
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
): express.RequestHandler {
    const routeFunction: Function = descriptor.value;

    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<void> => {
        /** get params metadata of route */
        const KEY = String(propertyKey);
        const params: IRouteParam[] = Reflect.getMetadata(`${KEY}_PARAMS`, target) || [];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const routeHandlerArgs = { req, res, next } as any;
        const self: Instance = Reflect.getMetadata('SELF', target);

        /** redefine route function args with mapped params path */
        const args: unknown[] = [];
        for (const param of params) {
            args[param.index] = param.path.reduce((prev, curr) => prev && prev[curr] || null, routeHandlerArgs);
        }

        try {
            const result: unknown = await routeFunction.apply(self, args);
            if (!result) {
                return next();
            }
            const customStatus: HttpCode = Reflect.getMetadata('HTTP_STATUS', routeFunction);
            res.status(customStatus || HttpCode.OK).json(result);
        } catch (err) {
            next(err);
        }
    };
}


export const Get = routeDecorator(RouteMethods.GET);
export const Post = routeDecorator(RouteMethods.POST);
export const Put = routeDecorator(RouteMethods.PUT);
export const Delete = routeDecorator(RouteMethods.DELETE);
export const Patch = routeDecorator(RouteMethods.PATCH);
