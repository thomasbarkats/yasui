import {
    Constructible,
    CoreConfig,
    IController,
    IControllerRoute,
    Injection,
} from '../types/interfaces';
import { LoggerService } from '../services';
import { Scopes } from '../types/enums';


interface ValidationError {
    className: string;
    issue: string;
    suggestion: string | undefined;
}


export class DecoratorValidator {
    private errors: Record<string, ValidationError[]>;

    constructor(private readonly appConfig: CoreConfig) {
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
        const className: string = target.name;

        if (typeof target !== 'function') {
            this.addError(
                className,
                'Controller must be a class',
                'Use @Controller on a class declaration'
            );
        }

        const routes: IControllerRoute[] = Reflect.getMetadata('ROUTES', target.prototype) || [];
        if (routes.length === 0) {
            this.addError(
                className,
                'Controller has no route methods',
                'Add @Get, @Post, @Put, @Delete, or @Patch methods'
            );
        }

        routes.forEach((route: IControllerRoute) => {
            this.validateRouteMethod(className, target.prototype, route);
        });

        this.throwError(className);
    }

    // Middleware use() method implementation already ensured by typing

    public validateInjectable(
        target: Constructible,
        scope: Scopes,
        buildStack: Set<string>
    ): void {
        const className: string = target.name;

        if (typeof target !== 'function') {
            this.addError(
                className,
                'Injectable must be a class',
                'Use @Injectable on a class declaration'
            );
        }

        const buildStackArray: string[] = Array.from(buildStack);
        const cycle: string = [...buildStackArray, className].join(' -> ');

        if (buildStackArray.indexOf(className) !== -1) {
            if (scope === Scopes.SHARED || className === buildStackArray[buildStackArray.length - 1]) {
                this.addError(
                    className,
                    `Circular dependency detected: ${cycle}`,
                    'Consider refactoring your dependencies or use @Scope(Scopes.LOCAL) for local instances'
                );
            }
        }

        const deps: Constructible[] = Reflect.getMetadata('design:paramtypes', target) || [];
        const preInjectedDeps: Record<number, string> = Reflect.getMetadata('PRE_INJECTED_DEPS', target) || {};

        deps.forEach((Dep, idx) => {
            if (Dep === undefined || Dep.prototype.toString() === 'function () { [native code] }') {
                this.addError(
                    className,
                    `Dependency at position ${idx} is undefined (${cycle} -> <?>)`,
                    'This usually means there is a circular import between files or a missing or bad import statement'
                    + '\nCheck your import statements and ensure there is no circular import between files'
                );

            } else if (preInjectedDeps[idx]) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if (!this.appConfig.injections?.find((inj: Injection<any>) => inj.token === preInjectedDeps[idx])) {
                    this.addError(
                        className,
                        `Injection token '${preInjectedDeps[idx]}' is not registered`,
                        `Register token in your app config: \`{ ..., injections: [..., { token: '${preInjectedDeps[idx]}', provide: <any> }] }\``
                    );
                }

            } else if (!Reflect.getMetadata('INJECTABLE', Dep)) {
                this.addError(
                    className,
                    `Dependency at position ${idx} (${buildStackArray[buildStackArray.length-1]} -> ${Dep.name}) is not injectable`,
                    'Add @Injectable on class declaration'
                );
            }
        });

        this.throwError(className);
    }


    private validateRouteMethod(
        className: string,
        prototype: Record<string, Function>,
        route: IControllerRoute,
    ): void {
        if (!prototype[route.methodName]) {
            return;
        }
        const paramTypes = Reflect.getMetadata('design:paramtypes', prototype, route.methodName) || [];
        const paramNames: string[] = this.getParameterNames(prototype[route.methodName]);

        // Ensure parameter decorators usage
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paramTypes.forEach((type: any, index: number) => {
            if (type === String || type === Number || type === Boolean) {
                const hasDecorator = route.params.some(param => param.index === index);
                if (!hasDecorator) {
                    this.addError(
                        className,
                        `Parameter '${paramNames[index]}' in ${route.methodName}() needs a decorator`,
                        'Add @Req, @Res, @Next, @Header, @Param, @Query, @Body, or @Logger decorator'
                    );
                }
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
}
