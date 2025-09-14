import { RouteRequestParamTypes } from '../enums/index.js';
import { Instance } from './utils.i.js';


export interface IParamMetadata {
  /** Source of the parameter (body, query, param, headers etc) */
  readonly type: RouteRequestParamTypes;
  /** Property name in the request source object */
  readonly name?: string;
  /** Underlying type of the parameter, based on the type definition in the route handler */
  readonly metatype?: Function;
}

/** Pipe-transform interface */
export interface IPipeTransform extends Instance {
  /**
   * @param value - Raw parameter value from request
   * @param metadata - Parameter metadata (type, source, property name)
   * @returns Transformed/validated value
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform: (value: any, metadata: IParamMetadata) => Promise<any> | any;
}
