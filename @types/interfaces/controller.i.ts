import { RequestHandler } from 'express';
import { HttpCode, RouteMethods } from '../enums';
import { Instance, Constructible } from './utils.i';
import { TMiddleware } from './middleware.i';


/** Controller type */
export type TController = Constructible<IController>;

/** Controller instance type */
export type IController = Instance;


export interface IControllerRoute {
    method: RouteMethods;
    path: string;
    middlewares: TMiddleware[];
    function: RequestHandler;
    methodName: string;
    defaultStatus?: HttpCode;
    params: IRouteParam[];
}


export interface IRouteParam {
    index: number;
    path: string[];
}
