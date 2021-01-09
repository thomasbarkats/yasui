import { RequestHandler, Router } from 'express';
import { RouteMethods } from '../enums';


export interface IController {
    path: string,
    configureRoutes: (debug?: boolean) => Router,
}

export interface IControllerRoute {
    method: RouteMethods,
    path: string,
    middlewares?: RequestHandler[],
    function: RequestHandler,
}
