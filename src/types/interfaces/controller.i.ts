/* eslint-disable @typescript-eslint/no-explicit-any */

import { RequestHandler, Router } from 'express';
import { RouteMethods } from '../enums';


/** controller type */
export interface TController extends Function {
    new (): { [index: string]: any };
}

/** controller interface */
export interface IController {
    path: string,
    configureRoutes: (self: this, debug?: boolean) => Router,
}


export interface IControllerRoute {
    method: RouteMethods,
    path: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    middlewares?: Function[],
    function: RequestHandler,
}
