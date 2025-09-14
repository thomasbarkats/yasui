import { HttpCode, ReflectMetadata } from '~types/enums';
import { ApiPropertyDefinition, Constructible } from '~types/interfaces';
import { OpenAPISchema } from '~types/openapi';
import { HttpError, ErrorResourceSchema } from './error.resource.js';
import { getMetadata, defineMetadata } from './reflect.js';
import { resolveSchema } from './index.js';


export const ERROR_RESOURCE_SCHEMA_NAME = 'Error Response';

export type DecoratorUsage =
  | 'PrimitiveSchema'
  | 'RefSchema'
  | 'ObjectSchema'
  | 'Array'
  | 'Enum'
  | 'Constructible'
  | 'Record';


export function extractDecoratorUsage(def: ApiPropertyDefinition): DecoratorUsage {
  if (typeof def === 'function') {
    return 'Constructible';
  } else if (Array.isArray(def)) {
    return 'Array';
  } else if ('$ref' in def) {
    return 'RefSchema';
  } else if ('type' in def) {
    return def.type === 'object' ? 'ObjectSchema' : 'PrimitiveSchema';
  } else if ('enum' in def) {
    return 'Enum';
  }
  return 'Record';
}

export function mapTypeToSchema(type: Function): OpenAPISchema {
  switch (type) {
    case String: return { type: 'string' };
    case Number: return { type: 'number' };
    case Boolean: return { type: 'boolean' };
    case Date: return { type: 'string', format: 'date-time' };
    case Array: return { type: 'array', items: { type: 'string' } };
    case Object: return { type: 'object' };
    default:
      if (type.name && type.name !== 'Object') {
        return { $ref: '' };
      }
      return { type: 'object' };
  }
}

export function overloadCustomErrorDefinition<T extends HttpError>(
  statusCode: HttpCode = 500,
  ErrorDataClass: Constructible<T>,
): Constructible<T> {
  const errorDataClassDefinition = getMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, ErrorDataClass.prototype);
  const errorDataClassSchema: Record<string, OpenAPISchema> = {};

  for (const property in errorDataClassDefinition) {
    errorDataClassSchema[property] = resolveSchema(errorDataClassDefinition[property]);
  }

  defineMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, {
    ...ErrorResourceSchema(statusCode).properties,
    data: {
      type: 'object',
      properties: errorDataClassSchema,
    }
  }, ErrorDataClass.prototype);

  return ErrorDataClass;
}
