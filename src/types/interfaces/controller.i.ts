import { RequestHandler, Router } from 'express';
import { RouteMethods } from '../enums';


export interface IController {
    path: string,
    configureRoutes: (debug?: boolean) => Router,
}

export interface IControllerRoute {
    method: RouteMethods,
    path: string,
    // eslint-disable-next-line @typescript-eslint/ban-types
    middlewares?: Function[],
    function: RequestHandler,
}
