import { RequestHandler, NextFunction, YasuiRequest } from '../web.js';
import { ReflectMetadata, getMetadata } from './reflect.js';
import { RouteRequestParamTypes } from '../enums/index.js';
import { HttpError } from './error.resource.js';
import { HttpCode } from '../enums/index.js';
import {
  IRouteParam,
  IPipeTransform,
  IParamMetadata,
  ArrayItem,
  JsonValue,
  EnumLike,
  EnumValues,
} from '../interfaces/index.js';


/** Create yasui route handler from controller/middleware method */
export function routeHandler(
  target: Function,
  descriptor: PropertyDescriptor,
  params: IRouteParam[],
  pipes: IPipeTransform[],
  isMiddleware?: boolean,
  strictValidation?: boolean,
  maxBodySize?: number,
): RequestHandler {
  const routeFunction: Function = descriptor.value;

  // Cache metadata lookups at route registration time (not per-request)
  const self = getMetadata(ReflectMetadata.SELF, target.prototype) || {};
  const methodDeps: Record<number, unknown> =
    getMetadata(ReflectMetadata.RESOLVED_METHOD_DEPS, self, String(descriptor.value.name)) || {};

  // Pre-calculate max index for argument array allocation
  const allIndexes = [
    ...params.map(p => p.index),
    ...Object.keys(methodDeps).map(k => parseInt(k))
  ];
  const maxIndex = allIndexes.length > 0 ? Math.max(...allIndexes) : -1;

  return async (
    req: YasuiRequest,
    next?: NextFunction,
  ): Promise<void | Response | JsonValue> => {
    req.source = target.name;
    const args: unknown[] = new Array(maxIndex + 1);

    const needsBody = params.some(p => p.path[1] === 'body');
    if (
      needsBody &&
      req.method !== 'GET' &&
      req.headers.get('content-type')?.includes('application/json')
    ) {
      // Check body size limit before parsing
      if (maxBodySize) {
        const contentLength = req.headers.get('content-length');
        if (contentLength) {
          const bodySize = parseInt(contentLength, 10);
          if (!isNaN(bodySize) && bodySize > maxBodySize) {
            throw new HttpError(
              HttpCode.REQUEST_ENTITY_TOO_LARGE,
              `Request body size (${bodySize} bytes) exceeds maximum allowed size (${maxBodySize} bytes)`
            );
          }
        }
      }

      try {
        await req.json();
      } catch (err) {
        if (strictValidation) {
          const errorMsg = err instanceof Error ? err.message : 'Invalid JSON';
          throw new HttpError(
            HttpCode.BAD_REQUEST,
            `Failed to parse JSON body: ${errorMsg}`
          );
        }
        // Body parsing failed, will be undefined
      }
    }

    // Bind route parameters (@Param, @Body, @Query, etc.) with type casting and pipes
    for (const param of params) {
      let value: unknown;

      if (param.path[0] === 'next') {
        value = next;
      } else if (param.path[0] === 'req' && param.path[1] === 'headers' && param.path.length === 3) {
        value = req.headers.get(param.path[2]) ?? null;
      } else if (param.path[0] === 'req' && param.path[1] === 'body') {
        // Access parsed body instead of ReadableStream
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = param.path.slice(2).reduce((prev: any, curr: string) => prev?.[curr] ?? null, req.parsedBody);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        value = param.path.slice(1).reduce((prev: any, curr: string) => prev?.[curr] ?? null, req);
      }

      // Cast string values from HTTP (params/query/headers) to target types
      if (value !== null && param.type && shouldCastParam(param.path)) {
        value = castParamValue(
          <string>value,
          param.type,
          param.path[2],
          strictValidation,
          param.itemsType,
          param.enumValues
        );
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

    const result = await routeFunction.apply(self, args);

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
  value: string | string[],
  paramType: Function,
  paramName: string,
  strictValidation?: boolean,
  itemsType?: ArrayItem,
  enumValues?: EnumLike | EnumValues,
): unknown {
  // Handle Array type first (uses all values)
  if (paramType === Array) {
    const arrayValues = Array.isArray(value) ? value : [value];
    if (itemsType) {
      return arrayValues.map((v, idx) => {
        return castParamValue(v, itemsType, `${paramName}[${idx}]`, strictValidation);
      });
    }
    return arrayValues;
  }

  // For non-Array types, use first value if array is provided
  const singleValue = Array.isArray(value) ? value[0] : value;

  // Handle enum validation if enumValues are provided
  if (enumValues) {
    let allowedValues = Array.isArray(enumValues)
      ? enumValues
      : Object.values(enumValues);

    // For numeric enums (bidirectional mapping), filter to only keep numeric values
    // Numeric enums have both string keys and numeric values in Object.values()
    const hasNumbers = allowedValues.some(v => typeof v === 'number');
    const hasStrings = allowedValues.some(v => typeof v === 'string');
    if (hasNumbers && hasStrings) {
      // This is a numeric enum with bidirectional mapping - keep only numeric values
      allowedValues = allowedValues.filter(v => typeof v === 'number');
    }

    if (allowedValues.includes(singleValue)) {
      return singleValue;
    }

    if (hasNumbers) {
      const numValue = Number(singleValue);
      if (!isNaN(numValue) && allowedValues.includes(numValue)) {
        return numValue;
      }
    }

    if (strictValidation) {
      throw new HttpError(
        HttpCode.BAD_REQUEST,
        `Parameter '${paramName || 'value'}' expected one of [${allowedValues.join(', ')}], got '${singleValue}'`
      );
    }
    return null;
  }

  switch (paramType) {
    case Number: {
      const num = Number(singleValue);
      if (strictValidation && isNaN(num)) {
        throw new HttpError(
          HttpCode.BAD_REQUEST,
          `Parameter '${paramName || 'value'}' expected number, got '${singleValue}'`
        );
      }
      return num;
    }
    case Boolean:
      return singleValue === 'true' || singleValue === '1';
    case Date: {
      const date = new Date(singleValue);
      if (strictValidation && isNaN(date.getTime())) {
        throw new HttpError(
          HttpCode.BAD_REQUEST,
          `Parameter '${paramName || 'value'}' expected valid date, got '${singleValue}'`
        );
      }
      return date;
    }
    case String:
      return singleValue;
    default:
      try {
        return JSON.parse(singleValue);
      } catch {
        if (strictValidation) {
          throw new HttpError(
            HttpCode.BAD_REQUEST,
            `Parameter '${paramName || 'value'}' expected valid JSON, got '${singleValue}'`
          );
        }
        return null;
      }
  }
}
