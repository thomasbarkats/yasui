import { ReflectMetadata, RouteParamTypes } from '~types/enums';
import { RouteRequestParamTypes } from '~types/enums';
import { IRouteParam } from '~types/interfaces';
import { getMetadata, defineMetadata } from '../utils/reflect';


/** create express route-parameter decorator */
function routeParamDecorator(source: RouteParamTypes): Function {
  return function (): ParameterDecorator {
    return extractParam(source);
  };
}

/** create express route-request-parameter decorator */
export function routeRequestParamDecorator(reqProperty: string): Function {
  return function (
    varName?: string
  ): ParameterDecorator {
    return extractParam(RouteParamTypes.REQ, reqProperty, varName);
  };
}


/** extract route param from express req object */
function extractParam(
  source: RouteParamTypes,
  reqProperty?: string,
  varName?: string
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

    const methodName = String(propertyKey);
    const routeParam: IRouteParam = { index: parameterIndex, path };
    const routeParams = getMetadata(ReflectMetadata.PARAMS, target, methodName) || [];

    /** add mapped param to route metadata */
    defineMetadata(
      ReflectMetadata.PARAMS,
      [...routeParams, routeParam],
      target,
      methodName,
    );
  };
}


export const Req = routeParamDecorator(RouteParamTypes.REQ);
export const Res = routeParamDecorator(RouteParamTypes.RES);
export const Next = routeParamDecorator(RouteParamTypes.NEXT);

export const Header = routeRequestParamDecorator(RouteRequestParamTypes.HEADER);
export const Param = routeRequestParamDecorator(RouteRequestParamTypes.PARAM);
export const Query = routeRequestParamDecorator(RouteRequestParamTypes.QUERY);
export const Body = routeRequestParamDecorator(RouteRequestParamTypes.BODY);
export const Logger = routeRequestParamDecorator(RouteRequestParamTypes.LOGGER);
