import { RequestHandler, NextFunction, YasuiRequest } from '../web.js';
import { ReflectMetadata, getMetadata } from './reflect.js';
import { RouteRequestParamTypes } from '../enums/index.js';
import { IRouteParam, IPipeTransform, IParamMetadata, ArrayItem } from '../interfaces/index.js';


/** Create yasui route handler from controller/middleware method */
export function routeHandler(
  target: Function,
  descriptor: PropertyDescriptor,
  params: IRouteParam[],
  pipes: IPipeTransform[],
  isMiddleware?: boolean,
): RequestHandler {
  const routeFunction: Function = descriptor.value;

  return async (
    req: YasuiRequest,
    next?: NextFunction,
  ): Promise<unknown> => {
    req.source = target.name;

    const self = getMetadata(ReflectMetadata.SELF, target.prototype) || {};

    const methodDeps: Record<number, unknown> =
      getMetadata(ReflectMetadata.RESOLVED_METHOD_DEPS, self, String(descriptor.value.name)) || {};

    const allIndexes = [
      ...params.map(p => p.index),
      ...Object.keys(methodDeps).map(k => parseInt(k))
    ];
    const maxIndex = allIndexes.length > 0 ? Math.max(...allIndexes) : -1;
    const args: unknown[] = new Array(maxIndex + 1);

    // Parse body if needed (only for non-GET requests with JSON content-type)
    if (req.method !== 'GET' && req.headers['content-type']?.includes('application/json')) {
      try {
        await req.json();
      } catch {
        // Body parsing failed, will be undefined
      }
    }

    // Bind route parameters (@Param, @Body, @Query, etc.) with type casting and pipes
    for (const param of params) {
      let value: unknown;

      if (param.path[0] === 'next') {
        value = next;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = param.path.slice(1).reduce((prev: any, curr: string) => prev?.[curr] ?? null, req);
      }

      // Cast string values from HTTP (params/query/headers) to target types
      if (value !== null && param.type && shouldCastParam(param.path)) {
        value = castParamValue(<string>value, param.type, param.itemsType);
      }

      // Apply validation/transformation pipes
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

    const result: unknown = await routeFunction.apply(self, args);

    if (isMiddleware && result === undefined && next) {
      return next();
    }

    return result;
  };
}

function shouldCastParam(path: string[]): boolean {
  if (path.length < 3) {
    return false;
  }
  return (
    path[1] === 'params' ||
    path[1] === 'query' ||
    path[1] === 'headers'
  );
}

function castParamValue(
  value: string,
  paramType: Function,
  itemsType?: ArrayItem
): unknown {
  switch (paramType) {
    case Number:
      return Number(value);
    case Boolean:
      return value === 'true' || value === '1';
    case Date:
      return new Date(<string>value);
    case Array:
      return Array.isArray(value)
        ? (itemsType ? value.map(v => castParamValue(v, itemsType)) : value)
        : [itemsType ? castParamValue(value, itemsType) : value];
    case String:
      return value;
    default:
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
  }
}
