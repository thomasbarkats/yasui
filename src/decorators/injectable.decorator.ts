import { ReflectMetadata, Scopes } from '~types/enums';
import { Constructible } from '~types/interfaces';
import { defineMetadata, getMetadata } from '../utils/reflect.js';


export function Injectable(): ClassDecorator {
  return function (target: Function): void {
    defineMetadata(ReflectMetadata.INJECTABLE, true, target);
  };
}

export function Inject(token?: string): ParameterDecorator {
  return function (
    target: object,
    propertyKey: string | symbol | undefined,
    index: number
  ): void {
    if (propertyKey) {
      const methodName = String(propertyKey);
      const methodsDeps = getMetadata(ReflectMetadata.METHOD_INJECTED_DEPS, target) || {};
      if (!methodsDeps[methodName]) {
        methodsDeps[methodName] = {};
      }
      if (token) {
        methodsDeps[methodName][index] = token;
      } else {
        const paramTypes = getMetadata(ReflectMetadata.DESIGN_PARAM_TYPES, target, methodName) || [];
        methodsDeps[methodName][index] = <Constructible>paramTypes[index];
      }
      defineMetadata(ReflectMetadata.METHOD_INJECTED_DEPS, methodsDeps, target);

    } else if (token) {
      const deps = getMetadata(ReflectMetadata.PRE_INJECTED_DEPS, target) || {};
      deps[index] = token;
      defineMetadata(ReflectMetadata.PRE_INJECTED_DEPS, deps, target);
    }
  };
}

export function Scope(scope: Scopes): ParameterDecorator {
  return function (
    target: object,
    propertyKey: string | symbol | undefined,
    index: number
  ): void {
    if (propertyKey) {
      const methodName = String(propertyKey);
      const scopes = getMetadata(ReflectMetadata.DEP_SCOPES, target, methodName) || {};
      scopes[index] = scope;
      defineMetadata(ReflectMetadata.DEP_SCOPES, scopes, target, methodName);
    }
    const scopes = getMetadata(ReflectMetadata.DEP_SCOPES, target) || {};
    scopes[index] = scope;
    defineMetadata(ReflectMetadata.DEP_SCOPES, scopes, target);
  };
}
