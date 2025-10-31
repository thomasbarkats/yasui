import { RouteRequestParamTypes, RouteParamTypes } from '../enums/index.js';
import { ReflectMetadata, getMetadata, defineMetadata } from '../utils/reflect.js';
import { ArrayItem, IRouteParam } from '../interfaces/index.js';


type RouteParamDecorator = (
  varName?: string,
  items?: [ArrayItem]
) => ParameterDecorator;

/** create yasui route-parameter decorator */
function routeParamDecorator(source: RouteParamTypes): RouteParamDecorator {
  return function (): ParameterDecorator {
    return extractParam(source);
  };
}


type RouteReqParamDecorator = (
  varName?: string,
  items?: [ArrayItem]
) => ParameterDecorator;

/** Factory function for creating parameter decorators that extract request data */
export function routeRequestParamDecorator(reqProperty: string): RouteReqParamDecorator {
  return function (
    varName?: string,
    items?: [ArrayItem]
  ): ParameterDecorator {
    return extractParam(RouteParamTypes.REQ, reqProperty, varName, items ? items[0] : undefined);
  };
}


/** extract route param from yasui request object */
function extractParam(
  source: RouteParamTypes,
  reqProperty?: string,
  varName?: string,
  itemsType?: ArrayItem
): ParameterDecorator {
  return function (
    target: object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ): void {
    if (!propertyKey) {
      return;
    }

    /** construct param access path */
    const path: string[] = [source];
    for (const node of [reqProperty, varName]) {
      if (node) {
        path.push(node);
      }
    }

    const paramTypes = getMetadata(ReflectMetadata.DESIGN_PARAM_TYPES, target, propertyKey) || [];
    const paramType = paramTypes[parameterIndex];
    const methodName = String(propertyKey);
    const routeParam: IRouteParam = {
      index: parameterIndex,
      type: paramType,
      itemsType,
      path,
    };

    /** add mapped param to route metadata */
    const routeParams = getMetadata(ReflectMetadata.PARAMS, target, methodName) || [];
    defineMetadata(
      ReflectMetadata.PARAMS,
      [...routeParams, routeParam],
      target,
      methodName,
    );
  };
}

/** Injects YasuiRequest object (Web Standard Request with yasui extensions) */
export const Req: RouteParamDecorator = routeParamDecorator(RouteParamTypes.REQ);
/** @deprecated Use return values instead of manual response handling */
export const Res: RouteParamDecorator = routeParamDecorator(RouteParamTypes.RES);
/** @deprecated Middleware should use async/await pattern instead of next() */
export const Next: RouteParamDecorator = routeParamDecorator(RouteParamTypes.NEXT);

/** Extracts specific header from `req.headers[name]`
 *  @param items If you are expecting an array, specify the type of items */
export const Header: RouteReqParamDecorator = routeRequestParamDecorator(RouteRequestParamTypes.HEADER);
/** Extracts specific path parameter from `req.params[name]`
 *  @param items If you are expecting an array, specify the type of items */
export const Param: RouteReqParamDecorator = routeRequestParamDecorator(RouteRequestParamTypes.PARAM);
/** Extracts specific query parameter from `req.query[name]`
 *  @param items If you are expecting an array, specify the type of items */
export const Query: RouteReqParamDecorator = routeRequestParamDecorator(RouteRequestParamTypes.QUERY);
/** Extracts specific body property or entire body if propertyName omitted */
export const Body: RouteReqParamDecorator = routeRequestParamDecorator(RouteRequestParamTypes.BODY);
/** Injects timed logger instance dedicated to the current request */
export const Logger: RouteReqParamDecorator = routeRequestParamDecorator(RouteRequestParamTypes.LOGGER);
