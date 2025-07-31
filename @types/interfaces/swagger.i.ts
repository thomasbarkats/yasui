import { IControllerRoute, TController } from './controller.i';
import { Constructible } from './utils.i';
import {
  ObjectSchema,
  OpenAPIComponents,
  OpenAPIInfo,
  OpenAPIOperation,
  OpenAPIPathItem,
  OpenAPISchema,
  OpenAPIServer,
  RefSchema,
} from '../openapi';


export type ApiPropertySchema =
  | ObjectSchema
  | RefSchema
  | (Exclude<OpenAPISchema, ObjectSchema | RefSchema> & {
    required?: boolean;
  });

export type TApiProperty = ApiPropertySchema | Constructible;


export interface ISwaggerRoute extends IControllerRoute {
  controllerName: string;
  controllerPrototype: TController['prototype'];
  controllerPath: string;
  fullPath: string;
  swaggerMetadata?: OpenAPIOperation;
}

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
