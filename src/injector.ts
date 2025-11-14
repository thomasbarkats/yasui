import kleur from 'kleur';
import { Scopes } from './enums/index.js';
import { LoggerService } from './services/index.js';
import { DecoratorValidator } from './utils/decorator-validator.js';
import { ReflectMetadata, getMetadata, defineMetadata } from './utils/reflect.js';
import { Constructible, Instance } from './interfaces/index.js';


const InheritedScopes: Scopes[] = [
  Scopes.DEEP_LOCAL,
];

export class Injector {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private registry: Map<string | symbol, any>;
  private buildStack: Set<string>;

  constructor(
    private readonly logger: LoggerService,
    private readonly decoratorValidator: DecoratorValidator | null,
    private readonly debug = false,
  ) {
    this.registry = new Map<string | symbol, Instance>();
    this.buildStack = new Set<string>();
  }


  public get<T extends Instance>(name: string | symbol): T {
    return this.registry.get(name) as T;
  }

  public register<T>(
    token: string | symbol,
    instance: T
  ): void {
    this.registry.set(token, instance);

    if (this.debug) {
      const name: string = (typeof token === 'symbol' && token.description)
        ? kleur.yellow(token.description)
        : token.toString();
      this.logger.debug(`register ${name}`);
    }
  }

  public deferred<T extends Instance>(
    token: string,
    factory: () => Promise<T>
  ): void {
    let resolvedInstance: T | null = null;

    factory()
      .then((instance) => {
        if (!instance || typeof instance !== 'object') {
          throw new Error(`Deferred injection '${token}' must return an object, got ${typeof instance}`);
        }
        if (this.debug) {
          this.logger.debug(`deferred injection ${token} ready`);
        }
        resolvedInstance = instance;
        return instance;
      })
      .catch((err) => {
        this.logger.error(`failed to resolve deferred injection '${token}':\n${err}`);
      });

    /** create a proxy that returns null while not ready */
    const proxy = new Proxy({}, {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: (target, prop): any => {
        if (resolvedInstance) {
          const value = resolvedInstance[prop];
          return typeof value === 'function' ? value.bind(resolvedInstance) : value;
        }
        return null;
      }
    });

    /** register the proxy immediately (synchronous) */
    this.register(token, proxy as T);
  }

  /** instantiates constructible by deeply binding dependencies */
  public build<T extends Instance>(
    Provided: Constructible<T>,
    scope: Scopes = Scopes.SHARED
  ): T {
    const className = Provided.name;

    const token: string | symbol = this.getToken(className, scope);
    const runningInstance: T = this.get(token);

    if (runningInstance) {
      return runningInstance;
    }

    this.buildStack.add(className);

    try {
      const dependencies: Instance[] = this.buildDependencies(Provided, scope);
      const instance: T = new Provided(...dependencies);
      this.markMethodsDependencies(Provided, instance, scope);
      this.register(token, instance);

    } finally {
      this.buildStack.delete(className);
    }
    return this.get(token);
  }


  /** build sub-dependencies or directly map token registered injection */
  private buildDependencies<T extends Instance>(
    Provided: Constructible<T>,
    scope: Scopes
  ): Instance[] {
    /** inject via constructor param types or pre-registered token injections */
    const deps = getMetadata(ReflectMetadata.DESIGN_PARAM_TYPES, Provided) || [];
    const preInjectedDeps = getMetadata(ReflectMetadata.PRE_INJECTED_DEPS, Provided) || {};

    const depScopes = getMetadata(ReflectMetadata.DEP_SCOPES, Provided) || {};

    return deps.map((Dep: Function, idx: number) => {

      if (preInjectedDeps[idx]) {
        this.decoratorValidator?.validateInjectionToken(Provided.name, preInjectedDeps[idx], Dep, idx);
        return this.get(preInjectedDeps[idx]);
      }

      this.decoratorValidator?.validateInjectable(Dep, scope, this.buildStack);

      /** spread current scope according to its type */
      const depScope: Scopes = InheritedScopes.includes(scope)
        ? scope
        : (depScopes[idx] || Scopes.SHARED);

      return this.build(<Constructible>Dep, depScope);
    });
  }

  private markMethodsDependencies<T extends Instance>(
    Provided: Constructible<T>,
    instance: T,
    scope: Scopes
  ): void {
    const methodsInjections = getMetadata(ReflectMetadata.METHOD_INJECTED_DEPS, Provided.prototype) || {};

    for (const methodName in methodsInjections) {
      const methodDeps = this.resolveMethodDependencies(
        Provided,
        methodName,
        methodsInjections[methodName],
        scope
      );
      defineMetadata(ReflectMetadata.RESOLVED_METHOD_DEPS, methodDeps, instance, methodName);
    }
  }

  private resolveMethodDependencies(
    Provided: Constructible,
    methodName: string,
    injections: Record<number, Function | string>,
    scope: Scopes
  ): Record<number, Instance> {
    const depScopes = getMetadata(ReflectMetadata.DEP_SCOPES, Provided.prototype, methodName) || {};
    const paramTypes = getMetadata(ReflectMetadata.DESIGN_PARAM_TYPES, Provided.prototype, methodName) || [];
    const methodDeps: Record<number, Instance> = {};

    for (const paramIndex in injections) {
      const Dep: Function | string = injections[paramIndex];

      if (typeof Dep === 'string') {
        this.decoratorValidator?.validateInjectionToken(Provided.name, Dep, paramTypes[paramIndex], Number(paramIndex));
        methodDeps[paramIndex] = this.get(Dep);
        continue;
      }

      this.decoratorValidator?.validateInjectable(Dep, scope, this.buildStack);

      const depScope: Scopes = InheritedScopes.includes(scope)
        ? scope
        : (depScopes[paramIndex] || Scopes.SHARED);

      methodDeps[paramIndex] = this.build(<Constructible>Dep, depScope);
    }
    return methodDeps;
  }

  private getToken(
    name: string,
    scope?: Scopes
  ): string | symbol {
    switch (scope) {
      case Scopes.LOCAL:
      case Scopes.DEEP_LOCAL:
        return Symbol(name);
      case Scopes.SHARED:
      default:
        return name;
    }
  }
}
