import { IControllerRoute, Instance, IRouteParam, ApiPropertyDefinition } from '../interfaces';
import { HttpCode } from './http-code.enum';
import { Scopes } from './scopes.enum';
import { OpenAPIOperation } from '../openapi';


export enum ReflectMetadata {
  DESIGN_TYPE = 'design:type',
  DESIGN_PARAM_TYPES = 'design:paramtypes',
  PRE_INJECTED_DEPS = 'PRE_INJECTED_DEPS',
  DEP_SCOPES = 'DEP_SCOPES',
  METHOD_INJECTED_DEPS = 'METHOD_INJECTED_DEPS',
  RESOLVED_METHOD_DEPS = 'RESOLVED_METHOD_DEPS',
  ROUTES = 'ROUTES',
  HTTP_STATUS = 'HTTP_STATUS',
  PARAMS = 'PARAMS',
  SELF = 'SELF',
  INJECTABLE = 'INJECTABLE',
  SWAGGER_OPERATION = 'SWG_OPS',
  SWAGGER_SCHEMA_DEFINITION = 'SWG_SCHEMA_DEF',
  SWAGGER_SCHEMA_NAME = 'SWG_SCHEMA_NAME',
}

export interface ReflectTypes {
  [ReflectMetadata.DESIGN_TYPE]: Function;
  [ReflectMetadata.DESIGN_PARAM_TYPES]: Function[];
  [ReflectMetadata.PRE_INJECTED_DEPS]: Record<number, string>;
  [ReflectMetadata.DEP_SCOPES]: Record<number, Scopes>;
  [ReflectMetadata.METHOD_INJECTED_DEPS]: Record<string, Record<number, Function | string>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [ReflectMetadata.RESOLVED_METHOD_DEPS]: Record<number, any>;
  [ReflectMetadata.ROUTES]: IControllerRoute[];
  [ReflectMetadata.HTTP_STATUS]: HttpCode;
  [ReflectMetadata.PARAMS]: IRouteParam[];
  [ReflectMetadata.SELF]: Instance;
  [ReflectMetadata.INJECTABLE]: boolean;
  [ReflectMetadata.SWAGGER_OPERATION]: OpenAPIOperation;
  [ReflectMetadata.SWAGGER_SCHEMA_DEFINITION]: Record<string, ApiPropertyDefinition>;
  [ReflectMetadata.SWAGGER_SCHEMA_NAME]: string;
}
