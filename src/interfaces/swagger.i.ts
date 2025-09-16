import { IControllerRoute, TController } from './controller.i.js';
import { Constructible } from './utils.i.js';
import {
  ObjectSchema,
  OpenAPIComponents,
  OpenAPIInfo,
  OpenAPIOperation,
  OpenAPIPathItem,
  OpenAPISchema,
  OpenAPIServer,
  RefSchema,
} from './openapi.i.js';


/** Primitive OpenAPI schema type for API properties */
export type ApiPropertyPrimitiveSchema = Exclude<OpenAPISchema, ObjectSchema | RefSchema> & {
  required?: boolean;
};

/** Safe record type for nested API property definitions */
export type SafeApiPropertyRecord = {
  type?: never;
  $ref?: never;
  enum?: never;
} & {
  [K in string]: (Constructible | [Constructible]) | SafeApiPropertyRecord;
};

/** Enum schema type for API properties */
export type ApiPropertyEnumSchema = {
  enum: (string | number)[] | Record<string, string | number>;
};

/** Swagger decorators usage */
export type ApiPropertyDefinition =
  | ApiPropertyPrimitiveSchema
  | ObjectSchema
  | RefSchema
  | ApiPropertyEnumSchema
  | Constructible
  | [Constructible]
  | SafeApiPropertyRecord;

/** Route metadata enhanced with Swagger/OpenAPI information */
export interface ISwaggerRoute extends IControllerRoute {
  controllerName: string;
  controllerPrototype: TController['prototype'];
  controllerPath: string;
  fullPath: string;
  swaggerMetadata?: OpenAPIOperation;
}

/** Complete Swagger/OpenAPI specification configuration */
export interface ISwaggerConfig {
  openapi: string;
  info: OpenAPIInfo;
  servers?: OpenAPIServer[];
  paths: Record<string, OpenAPIPathItem>;
  components?: OpenAPIComponents;
  security?: Array<Record<string, string[]>>;
  tags?: Array<{
    name: string;
    description?: string;
    externalDocs?: {
      description?: string;
      url: string;
    };
  }>;
  externalDocs?: {
    description?: string;
    url: string;
  };
}
