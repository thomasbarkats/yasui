import { defineMetadata, getMetadata } from '../utils/reflect.js';
import { Request, Response, RequestHandler, NextFunction } from 'express';
import { ReflectMetadata, RouteRequestParamTypes } from '~types/enums';
import { IControllerRoute, IParamMetadata, IPipeTransform, Constructible } from '~types/interfaces';
import { Injectable } from './injectable.decorator.js';


export const PipeTransform = Injectable;

export function UsePipes(...pipes: Constructible<IPipeTransform>[]): ClassDecorator & MethodDecorator {
  return function (
    target: object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ): void {
    if (propertyKey && descriptor) {
      defineMetadata(ReflectMetadata.PIPES, pipes, target, propertyKey);
    } else {
      defineMetadata(ReflectMetadata.PIPES, pipes, (<Function>target).prototype);
    }
  };
}


export function createPipeMiddleware(
  route: IControllerRoute,
  target: Function,
  pipes: IPipeTransform[]
): RequestHandler {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const routeParams = getMetadata(ReflectMetadata.PARAMS, target.prototype, route.methodName) || [];

    for (const param of routeParams) {
      const [, paramType, propertyName] = param.path;
      const source = req[<RouteRequestParamTypes>paramType];
      const metadata: IParamMetadata = {
        type: paramType as RouteRequestParamTypes,
        metatype: param.type,
        name: propertyName || ''
      };

      let paramValue = propertyName
        ? source?.[propertyName]
        : source;

      for (const pipe of pipes) {
        paramValue = await pipe.transform(paramValue, metadata);
      }
      if (propertyName) {
        source[propertyName] = paramValue;
      } else {
        req[<RouteRequestParamTypes>paramType] = paramValue;
      }
    }
    next();
  };
}
