import express from 'express';

import { HttpCode, RouteMethods } from '~types/enums';
import {
    IControllerRoute,
    Instance,
    IRouteParam,
    TMiddleware,
} from '~types/interfaces';


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
        const defaultStatus: HttpCode = Reflect.getMetadata('HTTP_STATUS', target, propertyKey);
        const params: IRouteParam[] = Reflect.getMetadata('PARAMS', target, methodName) || [];

        const route: IControllerRoute = {
            method,
            path,
            middlewares,
            function: routeHandler(
                target,
                descriptor,
                params,
                defaultStatus
            ),
            methodName,
            defaultStatus,
            params,
        };

        const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target) || [];
        Reflect.defineMetadata('ROUTES', [...routes, route], target);
    };
}


/** create express-route-handler from controller/middleware method */
export function routeHandler(
    target: object,
    descriptor: PropertyDescriptor,
    params: IRouteParam[],
    defaultStatus: HttpCode = HttpCode.OK,
): express.RequestHandler {
    const routeFunction: Function = descriptor.value;

    return async (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): Promise<void> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const routeHandlerArgs = { req, res, next } as any;
        const self: Instance = Reflect.getMetadata('SELF', target);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const methodDeps: Record<number, any> =
            Reflect.getMetadata('RESOLVED_METHOD_DEPS', self, String(descriptor.value.name)) || {};

        const allIndexes = [
            ...params.map(p => p.index),
            ...Object.keys(methodDeps).map(k => parseInt(k))
        ];
        const maxIndex = allIndexes.length > 0 ? Math.max(...allIndexes) : -1;
        const args: unknown[] = new Array(maxIndex + 1);

        // Bind Express parameters (@Param, @Body, etc.)
        for (const param of params) {
            args[param.index] = param.path.reduce((prev, curr) => prev && prev[curr] || null, routeHandlerArgs);
        }
        // Bind injected dependencies (@Inject)
        for (const indexStr in methodDeps) {
            const index = parseInt(indexStr);
            args[index] = methodDeps[index];
        }

        try {
            const result: unknown = await routeFunction.apply(self, args);
            res.status(defaultStatus).json(result);
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
