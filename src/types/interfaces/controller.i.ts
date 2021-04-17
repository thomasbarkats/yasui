import { RequestHandler, Router } from 'express';
import { RouteMethods } from '../enums';
import { TMiddleware } from './middleware.i';


/** controller type */
export type TController = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): IController;
}

/** controller interface */
export interface IController {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
}

/** controller decorated interface */
export interface IDController extends IController {
    path: string,
    configureRoutes: (self: this, debug?: boolean) => Router,
}


export interface IControllerRoute {
    method: RouteMethods,
    path: string,
    middlewares: TMiddleware[],
    function: RequestHandler,
}
