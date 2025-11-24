import { Constructible, Instance } from './utils.i.js';
import { TMiddleware } from './middleware.i.js';
import { HttpCode, RouteMethods } from '../enums/index.js';


/** Controller type */
export type TController = Constructible<IController>;

/** Controller instance type */
export type IController = Instance;


/** Route metadata for controller methods */
export interface IControllerRoute {
  method: RouteMethods;
  path: string;
  middlewares: TMiddleware[];
  descriptor: PropertyDescriptor;
  methodName: string;
  defaultStatus?: HttpCode;
  params: IRouteParam[];
}

/** Constructible type for array element validation */
// eslint-disable-next-line @typescript-eslint/no-wrapper-object-types
export type ArrayItem = Constructible<Number | Boolean | String>;

/** Parameter metadata for route handlers */
export interface IRouteParam {
  index: number;
  type: Function;
  itemsType?: ArrayItem;
  path: string[];
}
