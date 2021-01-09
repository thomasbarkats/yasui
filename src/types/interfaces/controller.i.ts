import { RequestHandler } from 'express';
import { RouteMethods } from '../enums';


export interface IController {
    path?: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any,
}

export interface IControllerRoute {
    method: RouteMethods,
    path: string,
    middlewares?: RequestHandler[],
    function: RequestHandler,
}
