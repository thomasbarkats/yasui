import { Scopes } from '../enums/index.js';
import { ReflectMetadata, defineMetadata, getMetadata } from '../utils/reflect.js';
import { Constructible } from '../interfaces/index.js';


/**
 * Mark a class as injectable —
 * Required to detect dependency injection through class constructor parameter types
 */
export function Injectable(): ClassDecorator {
  return function (target: Function): void {
    defineMetadata(ReflectMetadata.INJECTABLE, true, target);
  };
}

/**
 * Injects a dependency by token or auto-inferred type —
 * Usage:
 * - Class constructor parameters: Only needed for custom token injection
 * - Controller/middleware method parameters: Required for any dependency injection
 */
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

/**
 * Define scope of dependency injection
 * - SHARED (default): Use singleton instance shared across the application
 * - LOCAL: New instance the injection context
 * - DEEP_LOCAL: New instance, propagates locality to its own dependencies
 */
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
