import { ReflectMetadata } from '~types/enums';
import { HttpError, resolveSchema } from '../utils';
import {
  Constructible,
  ApiPropertyDefinition,
  ApiPropertyPrimitiveSchema,
} from '~types/interfaces';
import {
  OpenAPIParamater,
  OpenAPIResponses,
} from '~types/openapi';
import {
  getMetadata,
  defineMetadata
} from '../utils/reflect';
import {
  ERROR_RESOURCE_SCHEMA_NAME,
  extractDecoratorUsage,
  mapTypeToSchema,
  overloadCustomErrorDefinition,
} from '../utils/swagger';


/** swagger operation decorator */
export function ApiOperation(
  summary: string,
  description?: string,
  tags?: string[]
): MethodDecorator {
  return addSwaggerOperation(summary, description, tags);
}

/** add swagger operation metadata */
function addSwaggerOperation(
  summary: string,
  description?: string,
  tags?: string[]
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol
  ): void {
    const swaggerMetadata = getMetadata(ReflectMetadata.SWAGGER_OPERATION, target, propertyKey) || {};

    defineMetadata(ReflectMetadata.SWAGGER_OPERATION, {
      ...swaggerMetadata,
      summary,
      description,
      tags,
    }, target, propertyKey);
  };
}


/** swagger schema name decorator */
export function ApiSchema(name: string): ClassDecorator {
  return function (target: Function): void {
    defineMetadata(ReflectMetadata.SWAGGER_SCHEMA_NAME, name, target.prototype);
  };
}

/** swagger schema required property definition decorator */
export function ApiProperty(def?: ApiPropertyDefinition, isRequired: boolean = true): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {

    // Infer schema type for empty decorator usage
    if (!def) {
      const designType = getMetadata(ReflectMetadata.DESIGN_TYPE, target, propertyKey);
      if (designType) {
        const schema = mapTypeToSchema(designType);
        def = ('$ref' in schema) ? <Constructible>designType : schema;
      } else {
        def = { type: 'object' };
      }
    }
    if (extractDecoratorUsage(def) === 'PrimitiveSchema' && !('required' in def)) {
      (<ApiPropertyPrimitiveSchema>def).required = isRequired;
    }
    const existingProps = getMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, target) || {};
    existingProps[propertyKey as string] = def;
    defineMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, existingProps, target);
  };
}

/** swagger schema optional property definition decorator */
export function ApiPropertyOptional(def?: ApiPropertyDefinition): PropertyDecorator {
  return ApiProperty(def, false);
}


/** swagger response decorator */
export function ApiResponse(
  statusCode: number,
  descArg: string | Constructible,
  defArg?: ApiPropertyDefinition
): MethodDecorator {
  const { description, definition } = extractDescArgUsage(descArg, defArg);
  return addSwaggerResponse(statusCode, description, definition);
}

/** swagger error response decorator */
export function ApiErrorResponse<T extends HttpError>(
  statusCode: number,
  descArg: string | Constructible<T>,
  ErrorDataClass?: Constructible<T>
): MethodDecorator {
  const { description, definition } = extractDescArgUsage(descArg, ErrorDataClass);
  const errorSchema = definition
    ? overloadCustomErrorDefinition(statusCode, definition as Constructible<T>)
    : { $ref: `#/components/schemas/${encodeURIComponent(ERROR_RESOURCE_SCHEMA_NAME)}` };

  return addSwaggerResponse(statusCode, description, errorSchema);
}

/** add swagger response metadata */
function addSwaggerResponse(
  statusCode: number,
  description: string,
  definition?: ApiPropertyDefinition
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol
  ): void {
    const resolvedSchema = definition ? resolveSchema(definition) : undefined;

    const swaggerMetadata = getMetadata(ReflectMetadata.SWAGGER_OPERATION, target, propertyKey) || {};
    const responses: OpenAPIResponses = swaggerMetadata.responses || {};
    responses[statusCode] = { description, schema: resolvedSchema };
    if (resolvedSchema) {
      responses[statusCode].content = { 'application/json': { schema: resolvedSchema } };
    }

    defineMetadata(ReflectMetadata.SWAGGER_OPERATION, {
      ...swaggerMetadata,
      responses,
    }, target, propertyKey);
  };
}


/** swagger body decorator */
export function ApiBody(
  descArg?: string | Constructible,
  defArg?: ApiPropertyDefinition,
  contentType: string = 'application/json'
): MethodDecorator {
  const { description, definition } = extractDescArgUsage(descArg || '', defArg);
  return addSwaggerRequestBody(description, definition, contentType);
}

/** add swagger request body metadata */
function addSwaggerRequestBody(
  description?: string,
  definition?: ApiPropertyDefinition,
  contentType: string = 'application/json'
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol
  ): void {
    const resolvedSchema = definition ? resolveSchema(definition) : undefined;
    const swaggerMetadata = getMetadata(ReflectMetadata.SWAGGER_OPERATION, target, propertyKey) || {};

    defineMetadata(ReflectMetadata.SWAGGER_OPERATION, {
      ...swaggerMetadata,
      requestBody: {
        description: description || 'Request body',
        content: {
          [contentType]: {
            schema: resolvedSchema || { type: 'object' }
          }
        }
      }
    }, target, propertyKey);
  };
}


function extractDescArgUsage(
  description: string | Constructible,
  definition?: ApiPropertyDefinition,
): { description: string; definition?: ApiPropertyDefinition } {
  if (typeof description !== 'string') {
    definition = description;
    description = getMetadata(ReflectMetadata.SWAGGER_SCHEMA_NAME, description.prototype)
      || description.name;
  }
  return { description, definition };
}


/** create swagger parameter decorator */
function swaggerParamDecorator(paramIn: 'path' | 'query' | 'header'): Function {
  return function (
    name: string,
    description?: string,
    required?: boolean,
    definition?: ApiPropertyDefinition
  ): MethodDecorator {
    return addSwaggerParam(paramIn, name, description, required, definition);
  };
}

/** add swagger parameter to route metadata */
function addSwaggerParam(
  paramIn: 'path' | 'query' | 'header',
  name: string,
  description?: string,
  required?: boolean,
  definition?: ApiPropertyDefinition
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol
  ): void {
    const swaggerMetadata = getMetadata(ReflectMetadata.SWAGGER_OPERATION, target, propertyKey) || {};
    const parameters: OpenAPIParamater[] = swaggerMetadata.parameters || [];
    const resolvedSchema = definition ? resolveSchema(definition) : undefined;

    parameters.push({
      name,
      in: paramIn,
      required: required ?? (paramIn === 'path'), // 'path' always required
      description,
      schema: resolvedSchema || { type: 'string' },
    });

    defineMetadata(ReflectMetadata.SWAGGER_OPERATION, {
      ...swaggerMetadata,
      parameters
    }, target, propertyKey);
  };
}


export const ApiParam = swaggerParamDecorator('path');
export const ApiQuery = swaggerParamDecorator('query');
export const ApiHeader = swaggerParamDecorator('header');

// Aliases
export const AP = ApiProperty;
export const APO = ApiPropertyOptional;
