/** OpenAPI 3.0 simplified schema with generic typing */


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BaseSchema<T = any> {
    description?: string;
    example?: T;
    default?: T;
    nullable?: boolean;
    readOnly?: boolean;
    writeOnly?: boolean;
    deprecated?: boolean;
}

export interface StringSchema extends BaseSchema<string> {
    type: 'string';
    format?: 'date' | 'date-time' | 'email' | 'uri' | 'uuid' | 'binary' | 'byte' | 'password';
    pattern?: string;
    enum?: string[];
    minLength?: number;
    maxLength?: number;
}

export interface NumberSchema extends BaseSchema<number> {
    type: 'number';
    format?: 'float' | 'double';
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean;
    exclusiveMaximum?: boolean;
    multipleOf?: number;
    enum?: number[];
}

export interface IntegerSchema extends BaseSchema<number> {
    type: 'integer';
    format?: 'int32' | 'int64';
    minimum?: number;
    maximum?: number;
    exclusiveMinimum?: boolean;
    exclusiveMaximum?: boolean;
    multipleOf?: number;
    enum?: number[];
}

export interface BooleanSchema extends BaseSchema<boolean> {
    type: 'boolean';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ObjectSchema<T = Record<string, any>> extends BaseSchema<T> {
    type: 'object';
    properties?: Record<string, OpenAPISchema>;
    required?: string[];
    additionalProperties?: boolean | OpenAPISchema;
    minProperties?: number;
    maxProperties?: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ArraySchema<T = any[]> extends BaseSchema<T> {
    type: 'array';
    items: OpenAPISchema;
    minItems?: number;
    maxItems?: number;
    uniqueItems?: boolean;
}

export interface RefSchema {
    $ref: string;
}

export type OpenAPISchema =
    | StringSchema
    | NumberSchema
    | IntegerSchema
    | BooleanSchema
    | ObjectSchema
    | ArraySchema
    | RefSchema;


export interface OpenAPIInfo {
    title: string;
    version: string;
    description?: string;
    termsOfService?: string;
    contact?: {
        name?: string;
        url?: string;
        email?: string;
    };
    license?: {
        name: string;
        url?: string;
    };
}

export interface OpenAPIServer {
    url: string;
    description?: string;
    variables?: Record<string, {
        enum?: string[];
        default: string;
        description?: string;
    }>;
}

export interface OpenAPIPathItem {
    get?: OpenAPIOperation;
    post?: OpenAPIOperation;
    put?: OpenAPIOperation;
    delete?: OpenAPIOperation;
    options?: OpenAPIOperation;
    head?: OpenAPIOperation;
    patch?: OpenAPIOperation;
    trace?: OpenAPIOperation;
    parameters?: OpenAPIParamater[];
    summary?: string;
    description?: string;
}

export interface OpenAPIComponents {
    schemas?: Record<string, OpenAPISchema>;
    responses?: Record<string, {
        description: string;
        headers?: Record<string, OpenAPIParamater>;
        content?: Record<string, { schema: OpenAPISchema }>;
    }>;
    parameters?: Record<string, OpenAPIParamater>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    examples?: Record<string, any>;
    requestBodies?: Record<string, {
        description?: string;
        content: Record<string, { schema: OpenAPISchema }>;
        required?: boolean;
    }>;
    headers?: Record<string, OpenAPIParamater>;
    securitySchemes?: Record<string, {
        type: 'apiKey' | 'http' | 'oauth2' | 'openIdConnect';
        description?: string;
        name?: string;
        in?: 'query' | 'header' | 'cookie';
        scheme?: string;
        bearerFormat?: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        flows?: any; // OAuth flows
        openIdConnectUrl?: string;
    }>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface OpenAPIParamater<T = any> {
    name: string;
    in: 'path' | 'query' | 'header' | 'cookie';
    required?: boolean;
    schema?: OpenAPISchema;
    description?: string;
    deprecated?: boolean;
    allowEmptyValue?: boolean;
    style?: 'matrix' | 'label' | 'form' | 'simple' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
    explode?: boolean;
    allowReserved?: boolean;
    example?: T;
    examples?: Record<string, T>;
}

export interface OpenAPIOperation {
    summary?: string;
    description?: string;
    tags?: string[];
    operationId?: string;
    deprecated?: boolean;
    security?: Array<Record<string, string[]>>;
    servers?: OpenAPIServer[];
    responses?: OpenAPIResponses;
    parameters?: OpenAPIParamater[];
    requestBody?: {
        description?: string;
        content: Record<string, { schema: OpenAPISchema }>;
        required?: boolean;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callbacks?: Record<string, any>;
    externalDocs?: {
        description?: string;
        url: string;
    };
}

export type OpenAPIResponses = Partial<Record<number | 'default', {
    description: string;
    schema?: OpenAPISchema;
    headers?: Record<string, OpenAPIParamater>;
    content?: Record<string, { schema: OpenAPISchema }>;
}>>;
