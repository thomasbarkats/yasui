import {
    OpenAPISchema,
    OpenAPIOperation,
    OpenAPIResponses,
    OpenAPIParamater,
} from '../types/openapi';


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
        const swaggerMetadata: OpenAPIOperation = Reflect.getMetadata('SWAGGER', target, propertyKey) || {};

        Reflect.defineMetadata('SWAGGER', {
            ...swaggerMetadata,
            summary,
            description,
            tags,
        } satisfies OpenAPIOperation, target, propertyKey);
    };
}


/** swagger response decorator */
export function ApiResponse(
    statusCode: number,
    description: string,
    schema?: OpenAPISchema
): MethodDecorator {
    return addSwaggerResponse(statusCode, description, schema);
}

/** add swagger response metadata */
function addSwaggerResponse(
    statusCode: number,
    description: string,
    schema?: OpenAPISchema,
): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol
    ): void {
        const swaggerMetadata: OpenAPIOperation = Reflect.getMetadata('SWAGGER', target, propertyKey) || {};
        const responses: OpenAPIResponses = swaggerMetadata.responses || {};
        responses[statusCode] = { description, schema };
        if (schema) {
            responses[statusCode].content = { 'application/json': { schema: schema } };
        }

        Reflect.defineMetadata('SWAGGER', {
            ...swaggerMetadata,
            responses,
        } satisfies OpenAPIOperation, target, propertyKey);
    };
}


/** swagger body decorator */
export function ApiBody(
    description?: string,
    schema?: OpenAPISchema,
    contentType: string = 'application/json',
): MethodDecorator {
    return addSwaggerRequestBody(description, schema, contentType);
}

/** add swagger request body metadata */
function addSwaggerRequestBody(
    description?: string,
    schema?: OpenAPISchema,
    contentType: string = 'application/json',
): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol
    ): void {
        const swaggerMetadata: OpenAPIOperation = Reflect.getMetadata('SWAGGER', target, propertyKey) || {};

        Reflect.defineMetadata('SWAGGER', {
            ...swaggerMetadata,
            requestBody: {
                description: description || 'Request body',
                content: {
                    [contentType]: {
                        schema: schema || { type: 'object' }
                    }
                }
            }
        } satisfies OpenAPIOperation, target, propertyKey);
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
        const swaggerMetadata: OpenAPIOperation = Reflect.getMetadata('SWAGGER', target, propertyKey) || {};
        const parameters: OpenAPIParamater[] = swaggerMetadata.parameters || [];

        parameters.push({
            name,
            in: paramIn,
            required: required ?? (paramIn === 'path'), // 'path' always required
            description,
            schema: schema || { type: 'string' },
        });

        Reflect.defineMetadata('SWAGGER', {
            ...swaggerMetadata,
            parameters
        } satisfies OpenAPIOperation, target, propertyKey);
    };
}


export const ApiParam = swaggerParamDecorator('path');
export const ApiQuery = swaggerParamDecorator('query');
export const ApiHeader = swaggerParamDecorator('header');
