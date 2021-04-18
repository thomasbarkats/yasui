/* eslint-disable @typescript-eslint/ban-types */

import { RouteParamTypes } from '../types/enums';
import { RouteRequestParamTypes } from '../types/enums';
import { IRouteParam } from '../types/interfaces';


/** create express route-parameter decorator */
function routeParamDecorator(source: RouteParamTypes): Function {
    return function (): ParameterDecorator {
        return extractParam(source);
    };
}

/** create express route-request-parameter decorator */
function routeRequestParamDecorator(type: RouteRequestParamTypes): Function {
    return function (
        varName?: string
    ): ParameterDecorator {
        return extractParam(RouteParamTypes.REQ, type, varName);
    };
}


/** extract route param from express req object */
function extractParam(
    source: RouteParamTypes,
    type?: RouteRequestParamTypes,
    varName?: string
): ParameterDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        parameterIndex: number
    ): void {
        /** construct param access path */
        const path: string[] = [source];
        for (const node of [type, varName]) {
            node ? path.push(node) : true;
        }

        const routeParam: IRouteParam = {
            index: parameterIndex,
            path,
        };
        const KEY = String(propertyKey);
        const routeParams: IRouteParam[] = Reflect.getMetadata(`${KEY}_PARAMS`, target) || [];

        /** add mapped param to route metadata */
        Reflect.defineMetadata(
            `${KEY}_PARAMS`,
            [...routeParams, routeParam],
            target
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
