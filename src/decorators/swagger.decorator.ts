import { HttpError, resolveSchema } from '../utils/index.js';
import { ReflectMetadata, getMetadata, defineMetadata } from '../utils/reflect.js';
import {
  Constructible,
  ApiPropertyDefinition,
  ApiPropertyPrimitiveSchema,
  OpenAPIParamater,
  OpenAPIResponses,
} from '../interfaces/index.js';
import {
  ERROR_RESOURCE_SCHEMA_NAME,
  extractDecoratorUsage,
  mapTypeToSchema,
  overloadCustomErrorDefinition,
} from '../utils/swagger.js';


/** Documents API endpoint */
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


/**
 * Defines custom name for a class API schema
 * @default name Class.name // if non-decorated
 */
export function ApiSchema(name: string): ClassDecorator {
  return function (target: Function): void {
    defineMetadata(ReflectMetadata.SWAGGER_SCHEMA_NAME, name, target.prototype);
  };
}

/**
 * Defines property for a class API schema
 * @default schema.required true
 */
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

/** Defines non-required property for a class API schema */
export function ApiPropertyOptional(def?: ApiPropertyDefinition): PropertyDecorator {
  return ApiProperty(def, false);
}


/**
 * Documents API response
 * @param descArg can be used with class reference only (description will be the schema name)
 */
export function ApiResponse(
  statusCode: number,
  descArg: string | Constructible,
  defArg?: ApiPropertyDefinition
): MethodDecorator {
  const { description, definition } = extractDescArgUsage(descArg, defArg);
  return addSwaggerResponse(statusCode, description, definition);
}

/**
 * Documents API error response with base error schema and custom properties schema (record or class reference)
 * @param descArg can be used with with class reference only (description will be the schema name)
 */
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


/**
 * Documents request body schema and content type
 * @param descArg can be used with class reference only (description will be the schema name)
 * @default contentType "application/json"
 */
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


type SwaggerParamDecorator = (
  name: string,
  description?: string,
  required?: boolean,
  definition?: ApiPropertyDefinition
) => MethodDecorator;

/** create swagger parameter decorator */
function swaggerParamDecorator(paramIn: 'path' | 'query' | 'header'): SwaggerParamDecorator {
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


/** Documents path parameter with validation schema
 *  @default required false */
export const ApiParam: SwaggerParamDecorator = swaggerParamDecorator('path');
/** Documents query parameter with validation schema
 *  @default required false */
export const ApiQuery: SwaggerParamDecorator = swaggerParamDecorator('query');
/** Documents header parameter with validation schema
 *  @default required false */
export const ApiHeader: SwaggerParamDecorator = swaggerParamDecorator('header');


/** Alias for '@ApiProperty()` */
export const AP = ApiProperty;
/** Alias for `@ApiPropertyOptional()` */
export const APO = ApiPropertyOptional;
