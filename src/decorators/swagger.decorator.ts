import { ReflectMetadata } from '~types/enums';
import { TApiProperty } from '~types/interfaces';
import {
  OpenAPIParamater,
  OpenAPIResponses,
  OpenAPISchema,
} from '~types/openapi';
import { getMetadata, defineMetadata } from '../utils/reflect';
import { SwaggerService } from '../utils/swagger.service';
import { mapTypeToSchema } from '../utils/swagger';


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
export function ApiProperty(schema?: TApiProperty, isRequired: boolean = true): PropertyDecorator {
  return function (target: object, propertyKey: string | symbol): void {

    // Infer type if not specified
    if (!schema || (!('type' in schema) && typeof schema === 'object' && !('$ref' in schema))) {
      const designType = getMetadata(ReflectMetadata.DESIGN_TYPE, target, propertyKey);
      if (designType) {
        schema = mapTypeToSchema(designType);
      } else {
        schema = { type: 'object' };
      }
    }

    if (typeof schema === 'object' && !('required' in schema) && !('$ref' in schema) && schema.type !== 'object') {
      schema.required = isRequired;
    }
    const existingProps = getMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, target) || {};
    existingProps[propertyKey as string] = schema;
    defineMetadata(ReflectMetadata.SWAGGER_SCHEMA_DEFINITION, existingProps, target);
  };
}

/** swagger schema optional property definition decorator */
export function ApiPropertyOptional(schema?: TApiProperty): PropertyDecorator {
  return ApiProperty(schema, false);
}


/** swagger response decorator */
export function ApiResponse(
  statusCode: number,
  description: string,
  schema?: TApiProperty
): MethodDecorator {
  return addSwaggerResponse(statusCode, description, schema);
}

/** add swagger response metadata */
function addSwaggerResponse(
  statusCode: number,
  description: string,
  schema?: TApiProperty
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol
  ): void {
    const resolvedSchema = schema ? SwaggerService.resolveSchema(schema) : undefined;

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
  description?: string,
  schema?: TApiProperty,
  contentType: string = 'application/json'
): MethodDecorator {
  return addSwaggerRequestBody(description, schema, contentType);
}

/** add swagger request body metadata */
function addSwaggerRequestBody(
  description?: string,
  schema?: TApiProperty,
  contentType: string = 'application/json'
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol
  ): void {
    const resolvedSchema = schema ? SwaggerService.resolveSchema(schema) : undefined;
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


/** create swagger parameter decorator */
function swaggerParamDecorator(paramIn: 'path' | 'query' | 'header'): Function {
  return function (
    name: string,
    description?: string,
    required?: boolean,
    schema?: OpenAPISchema
  ): MethodDecorator {
    return addSwaggerParam(paramIn, name, description, required, schema);
  };
}

/** add swagger parameter to route metadata */
function addSwaggerParam(
  paramIn: 'path' | 'query' | 'header',
  name: string,
  description?: string,
  required?: boolean,
  schema?: OpenAPISchema
): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol
  ): void {
    const swaggerMetadata = getMetadata(ReflectMetadata.SWAGGER_OPERATION, target, propertyKey) || {};
    const parameters: OpenAPIParamater[] = swaggerMetadata.parameters || [];

    parameters.push({
      name,
      in: paramIn,
      required: required ?? (paramIn === 'path'), // 'path' always required
      description,
      schema: schema || { type: 'string' },
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
export const AP = ApiProperty();
export const APO = ApiPropertyOptional();
