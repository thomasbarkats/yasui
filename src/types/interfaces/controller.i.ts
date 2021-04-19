import { RequestHandler, Router } from 'express';
import { RouteMethods } from '../enums';
import { Instance, Constructible } from './utils.i';
import { TMiddleware } from './middleware.i';
import { Core } from '../../core';


/** controller type */
export type TController = Constructible<IController>;

/** controller instance type */
export type IController = Instance;

/** decorated controller interface */
export interface IDController extends IController {
    path: string,
    configureRoutes: (self: this, core: Core) => Router,
}


export interface IControllerRoute {
    method: RouteMethods,
    path: string,
    middlewares: TMiddleware[],
    function: RequestHandler,
}
