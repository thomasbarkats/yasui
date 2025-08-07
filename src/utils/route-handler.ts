import { Request, RequestHandler, Response, NextFunction } from 'express';

import { getMetadata } from './reflect';
import { HttpCode, ReflectMetadata, RouteRequestParamTypes } from '~types/enums';
import { IRouteParam, IPipeTransform, IParamMetadata } from '~types/interfaces';


/** create express-route-handler from controller/middleware method */
export function routeHandler(
  target: object,
  descriptor: PropertyDescriptor,
  params: IRouteParam[],
  pipes: IPipeTransform[],
  isMiddleware?: boolean,
  defaultStatus: HttpCode = HttpCode.OK,
): RequestHandler {
  const routeFunction: Function = descriptor.value;

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const routeHandlerArgs = { req, res, next } as any;
    const self = getMetadata(ReflectMetadata.SELF, target) || {};

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const methodDeps: Record<number, any> =
      getMetadata(ReflectMetadata.RESOLVED_METHOD_DEPS, self, String(descriptor.value.name)) || {};

    const allIndexes = [
      ...params.map(p => p.index),
      ...Object.keys(methodDeps).map(k => parseInt(k))
    ];
    const maxIndex = allIndexes.length > 0 ? Math.max(...allIndexes) : -1;
    const args: unknown[] = new Array(maxIndex + 1);

    // Bind Express parameters (@Param, @Body, etc.) with type casting and pipes
    for (const param of params) {
      let value = param.path.reduce((prev, curr) => prev && prev[curr] || null, routeHandlerArgs);

      if (value !== null && param.type && shouldCastParam(param.path)) {
        value = castParamValue(value, param.type);
      }

      if (pipes.length > 0) {
        const metadata: IParamMetadata = {
          type: param.path[1] as RouteRequestParamTypes,
          metatype: param.type,
          name: param.path[2]
        };
        for (const pipe of pipes) {
          value = await pipe.transform(value, metadata);
        }
      }

      args[param.index] = value;
    }

    // Bind injected dependencies (@Inject)
    for (const indexStr in methodDeps) {
      const index = parseInt(indexStr);
      args[index] = methodDeps[index];
    }

    try {
      const result: unknown = await routeFunction.apply(self, args);
      if (!res.headersSent) {
        if (result !== undefined || !isMiddleware) {
          res.status(defaultStatus).json(result);
        } else {
          next();
        }
      }
    } catch (err) {
      next(err);
    }
  };
}

function shouldCastParam(path: string[]): boolean {
  if (path.length < 2) {
    return false;
  }
  return (
    path[1] === 'params' ||
    path[1] === 'query' ||
    path[1] === 'headers'
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function castParamValue(value: string, paramType: Function): any {
  switch (paramType) {
    case Number:
      return Number(value);
    case Boolean:
      return value === 'true' || value === '1';
    case Date:
      return new Date(<string>value);
    case Array:
      return Array.isArray(value)
        ? value
        : new Array(value);
    case String:
      return value;
    default:
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
  }
}
