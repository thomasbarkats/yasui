import { IControllerRoute, Instance, IRouteParam } from '../interfaces';
import { HttpCode } from './http-code.enum';
import { Scopes } from './scopes.enum';
import { OpenAPIOperation } from '../openapi';


export enum ReflectMetadata {
  DESIGN_TYPE = 'design:paramtypes',
  PRE_INJECTED_DEPS = 'PRE_INJECTED_DEPS',
  DEP_SCOPES = 'DEP_SCOPES',
  METHOD_INJECTED_DEPS = 'METHOD_INJECTED_DEPS',
  RESOLVED_METHOD_DEPS = 'RESOLVED_METHOD_DEPS',
  ROUTES = 'ROUTES',
  HTTP_STATUS = 'HTTP_STATUS',
  PARAMS = 'PARAMS',
  SELF = 'SELF',
  SWAGGER = 'SWAGGER',
  INJECTABLE = 'INJECTABLE',
}

export interface ReflectTypes {
  [ReflectMetadata.DESIGN_TYPE]: Function[];
  [ReflectMetadata.PRE_INJECTED_DEPS]: Record<number, string>;
  [ReflectMetadata.DEP_SCOPES]: Record<number, Scopes>;
  [ReflectMetadata.METHOD_INJECTED_DEPS]: Record<string, Record<number, Function | string>>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [ReflectMetadata.RESOLVED_METHOD_DEPS]: Record<number, any>;
  [ReflectMetadata.ROUTES]: IControllerRoute[];
  [ReflectMetadata.HTTP_STATUS]: HttpCode;
  [ReflectMetadata.PARAMS]: IRouteParam[];
  [ReflectMetadata.SELF]: Instance;
  [ReflectMetadata.SWAGGER]: OpenAPIOperation;
  [ReflectMetadata.INJECTABLE]: boolean;
}
