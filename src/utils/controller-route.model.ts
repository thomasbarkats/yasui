import { RequestHandler } from 'express';
import { RouteMethods } from '../@types/enums';


export interface IControllerRoute {
    method: RouteMethods,
    path: string,
    middlewares?: RequestHandler[],
    function: RequestHandler,
}
