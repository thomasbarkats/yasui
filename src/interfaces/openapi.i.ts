/** OpenAPI 3.0 simplified schema with generic typing */

/** Base schema properties shared by all OpenAPI schema types */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface BaseSchema<T = any> {
  description?: string;
  example?: T;
  default?: T;
  /** Allows null values in addition to the defined type */
  nullable?: boolean;
  /** Property is only returned in responses, never accepted in requests */
  readOnly?: boolean;
  /** Property is only accepted in requests, never returned in responses */
  writeOnly?: boolean;
  deprecated?: boolean;
}

/** OpenAPI schema for string values with validation constraints */
export interface StringSchema extends BaseSchema<string> {
  type: 'string';
  /** Validates string format (e.g., 'email' enforces email pattern) */
  format?: 'date' | 'date-time' | 'email' | 'uri' | 'uuid' | 'binary' | 'byte' | 'password';
  /** Regular expression pattern for validation */
  pattern?: string;
  /** Restricts value to one of the specified strings */
  enum?: string[];
  minLength?: number;
  maxLength?: number;
}

/** OpenAPI schema for floating-point numbers */
export interface NumberSchema extends BaseSchema<number> {
  type: 'number';
  /** Precision hint for serialization */
  format?: 'float' | 'double';
  minimum?: number;
  maximum?: number;
  /** If true, value must be > minimum (not >= minimum) */
  exclusiveMinimum?: boolean;
  /** If true, value must be < maximum (not <= maximum) */
  exclusiveMaximum?: boolean;
  /** Value must be a multiple of this number */
  multipleOf?: number;
  enum?: number[];
}

/** OpenAPI schema for integer values */
export interface IntegerSchema extends BaseSchema<number> {
  type: 'integer';
  /** Bit width constraint for serialization */
  format?: 'int32' | 'int64';
  minimum?: number;
  maximum?: number;
  /** If true, value must be > minimum (not >= minimum) */
  exclusiveMinimum?: boolean;
  /** If true, value must be < maximum (not <= maximum) */
  exclusiveMaximum?: boolean;
  /** Value must be a multiple of this number */
  multipleOf?: number;
  enum?: number[];
}

/** OpenAPI schema for boolean values */
export interface BooleanSchema extends BaseSchema<boolean> {
  type: 'boolean';
}

/** OpenAPI schema for object types with property validation */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ObjectSchema<T = Record<string, any>> extends BaseSchema<T> {
  type: 'object';
  /** Schema definitions for each object property */
  properties?: Record<string, OpenAPISchema>;
  /** Array of property names that must be present */
  required?: string[];
  /** If false, extra properties are forbidden; if schema, validates extra properties */
  additionalProperties?: boolean | OpenAPISchema;
  minProperties?: number;
  maxProperties?: number;
}

/** OpenAPI schema for array types with element validation */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ArraySchema<T = any[]> extends BaseSchema<T> {
  type: 'array';
  /** Schema for validating each array element */
  items: OpenAPISchema;
  minItems?: number;
  maxItems?: number;
  /** If true, all array elements must be unique */
  uniqueItems?: boolean;
}

/** Reference to another schema definition */
export interface RefSchema {
  /** Reference path to another schema (e.g., "#/components/schemas/User") */
  $ref: string;
}

/** Union of all possible OpenAPI schema types */
export type OpenAPISchema =
  | StringSchema
  | NumberSchema
  | IntegerSchema
  | BooleanSchema
  | ObjectSchema
  | ArraySchema
  | RefSchema;

/** API metadata and documentation information */
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

/** Server configuration for API endpoints */
export interface OpenAPIServer {
  url: string;
  description?: string;
  variables?: Record<string, {
    enum?: string[];
    default: string;
    description?: string;
  }>;
}

/** Available HTTP operations for a specific path */
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

/** Reusable OpenAPI components and definitions */
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

/** Parameter definition for OpenAPI operations */
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

/** Complete OpenAPI operation specification */
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

/** Possible HTTP response definitions for an operation */
export type OpenAPIResponses = Partial<Record<number | 'default', {
  description: string;
  schema?: OpenAPISchema;
  headers?: Record<string, OpenAPIParamater>;
  content?: Record<string, { schema: OpenAPISchema }>;
}>>;
