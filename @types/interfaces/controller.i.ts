import { HttpCode, RouteMethods } from '../enums';
import { Constructible, Instance } from './utils.i';
import { TMiddleware } from './middleware.i';


/** Controller type */
export type TController = Constructible<IController>;

/** Controller instance type */
export type IController = Instance;


export interface IControllerRoute {
  method: RouteMethods;
  path: string;
  middlewares: TMiddleware[];
  descriptor: PropertyDescriptor;
  methodName: string;
  defaultStatus?: HttpCode;
  params: IRouteParam[];
}

export type ArrayItem = Constructible<number | boolean | Date | string>;

export interface IRouteParam {
  index: number;
  type: Function;
  itemsType?: ArrayItem;
  path: string[];
}
