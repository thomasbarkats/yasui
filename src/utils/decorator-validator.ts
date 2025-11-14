import { ReflectMetadata, getMetadata } from './reflect.js';
import { SwaggerService } from './swagger.service.js';
import { LoggerService } from '../services/index.js';
import { Scopes } from '../enums/index.js';
import {
  Constructible,
  IController,
  IControllerRoute,
  YasuiConfig,
} from '../interfaces/index.js';


interface ValidationError {
  className: string;
  issue: string;
  suggestion: string | undefined;
}


export class DecoratorValidator {
  private errors: Record<string, ValidationError[]>;

  constructor(private readonly appConfig: YasuiConfig) {
    this.errors = {};
  }

  public outputErrors(): void {
    if (!this.hasError()) {
      return;
    }
    let errorLog: string = '\n🚨 Decorator validation errors:';
    for (const err of Object.values(this.errors).flat()) {
      errorLog += `\n  • ${err.className}: ${err.issue}.`;
      if (err.suggestion) {
        errorLog += `\n    💡 ${err.suggestion}.`;
      }
    }
    new LoggerService().error(errorLog);
  }

  public hasError(): boolean {
    return !!Object.keys(this.errors).length;
  }

  public validateController(target: Constructible<IController>): void {
    if (typeof target !== 'function') {
      this.addError(
        'App',
        'Controller must be a class',
        'Use @Controller on a class declaration'
      );
    }

    const routes = getMetadata(ReflectMetadata.ROUTES, target.prototype) || [];
    if (routes.length === 0) {
      this.addError(
        target.name,
        'Controller has no route methods',
        'Add @Get, @Post, @Put, @Delete, or @Patch methods'
      );
    }

    routes.forEach((route: IControllerRoute) => {
      this.validateRouteMethod(target.name, target.prototype, route);
    });

    this.throwError(target.name);
  }

  // Middleware use() method implementation already ensured by typing

  public validateInjectable(
    target: Function,
    scope: Scopes,
    buildStack: Set<string>
  ): void {
    const buildStackArray: string[] = Array.from(buildStack);
    const callerName: string = buildStackArray[buildStackArray.length - 1];

    if (!this.isConstructible(target)) {
      this.addError(
        callerName,
        'Injectable must be a class',
        'Use @Injectable on a class declaration'
      );
    }

    const cycle: string = [...buildStackArray, target.name].join(' -> ');

    if (buildStackArray.indexOf(target.name) !== -1) {
      if (scope === Scopes.SHARED || target.name === callerName) {
        this.addError(
          callerName,
          `Circular dependency detected: ${cycle}`,
          'Consider refactoring your dependencies or use @Scope(Scopes.LOCAL) for local instances'
        );
      }
    }

    const deps = getMetadata(ReflectMetadata.DESIGN_PARAM_TYPES, target) || [];
    const preInjectedDeps = getMetadata(ReflectMetadata.PRE_INJECTED_DEPS, target) || {};

    deps.forEach((Dep, idx) => {
      if (Dep === undefined || Dep.prototype.toString() === 'function () { [native code] }') {
        this.addError(
          callerName,
          `Dependency at position ${idx} is undefined (${cycle} -> <?>)`,
          'This usually means there is a circular import between files or a missing or bad import statement'
          + '\nCheck your import statements and ensure there is no circular import between files'
        );

      } else if (preInjectedDeps[idx]) {
        this.validateInjectionToken(callerName, preInjectedDeps[idx], Dep, idx);

      } else if (!getMetadata(ReflectMetadata.INJECTABLE, Dep)) {
        this.addError(
          callerName,
          `Dependency at position ${idx} (${callerName} -> ${Dep.name}) is not injectable`,
          'Add @Injectable on class declaration'
        );
      }
    });

    this.throwError(callerName);
  }

  public validateInjectionToken(
    callerName: string,
    tokenReg: string,
    paramType: Function | undefined,
    paramIndex: number,
  ): void {
    const injection = this.appConfig.injections?.find(({ token }) => token === tokenReg);
    if (!injection) {
      this.addError(
        callerName,
        `Injection token '${tokenReg}' is not registered`,
        `Register token in your app config: \`{ ..., injections: [..., { token: '${tokenReg}', provide: <any> }] }\``
      );
    } else if ('factory' in injection && injection.deferred) {
      if (paramType?.name !== 'Object') {
        this.addError(
          callerName,
          `Deferred async injection '${tokenReg}' at parameter ${paramIndex} must be typed as nullable`,
          `Add a null union type: \`@Inject('${tokenReg}') param: ${paramType?.name} | null\``
        );
      }
    }
  }

  public validateSwaggerSchemaName(
    callerName: string,
    name: string
  ): void {
    const existingSchemaClass = SwaggerService.schemas.get(name)?.className;
    if (existingSchemaClass !== callerName) {
      this.addError(
        callerName,
        `Schema '${name}' already exists (Class ${existingSchemaClass})`,
        'Use a different name for your schema'
      );
    }
  }


  private validateRouteMethod(
    className: string,
    prototype: Record<string, Function>,
    route: IControllerRoute,
  ): void {
    if (!prototype[route.methodName]) {
      return;
    }
    const paramTypes = getMetadata(ReflectMetadata.DESIGN_PARAM_TYPES, prototype, route.methodName) || [];
    const paramNames = this.getParameterNames(prototype[route.methodName]);

    const methodsInjections = getMetadata(ReflectMetadata.METHOD_INJECTED_DEPS, prototype) || {};

    // Ensure parameter decorators usage
    paramTypes.forEach((type: Function, index: number) => {
      const hasDecorator = !!(methodsInjections[route.methodName] || {})[index]
        || route.params.some(param => param.index === index);
      if (!hasDecorator) {
        this.addError(
          className,
          `Parameter '${paramNames[index]}' in ${route.methodName}() needs a decorator`,
          'Add @Req, @Res, @Next, @Header, @Param, @Query, @Body, @Logger or @Inject decorator'
        );
      }
    });
  }


  private getParameterNames(func: Function): string[] {
    const funcStr: string = func.toString();
    const match: RegExpMatchArray | null = funcStr.match(/\(([^)]*)\)/);
    if (!match || !match[1]) {
      return [];
    };
    return match[1]
      .split(',')
      .map(param => param.trim().split(/\s+/)[0] || '')
      .filter(name => name && name !== '');
  }

  private addError(className: string, issue: string, suggestion?: string): void {
    if (!this.errors[className]) {
      this.errors[className] = [];
    }
    this.errors[className].push({ className, issue, suggestion });
  }

  private throwError(className: string): void {
    if (this.errors[className]?.length) {
      throw new Error(`${className} has not passed its validation checks`);
    }
  }


  private isConstructible(fn: Function): boolean {
    return typeof fn === 'function' && !!fn.prototype && fn.prototype.constructor === fn;
  }
}
