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

/** Enum-like object (TypeScript enum or as const object) */
export type EnumLike = Record<string, string | number>;

/** Array of allowed enum values for validation */
export type EnumValues = readonly (string | number)[];

/** Parameter metadata for route handlers */
export interface IRouteParam {
  index: number;
  type: Function;
  path: string[];
  itemsType?: ArrayItem;
  /** Optional enum values for validation (enum object or array of allowed values) */
  enumValues?: EnumLike | EnumValues;
}
