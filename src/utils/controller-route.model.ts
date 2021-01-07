/* eslint-disable @typescript-eslint/no-explicit-any */

import { RouteMethods } from '../enums';


export interface IControllerRoute {
    method: RouteMethods,
    path: string,
    middlewares?: any[],
    function: any,
}
