import { Scopes } from '~types/enums';
import { Constructible } from '~types/interfaces';


export function Injectable(): ClassDecorator {
    return function (target: Function): void {
        Reflect.defineMetadata('INJECTABLE', true, target);
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
            const methodsDeps: Record<string, Record<number, Constructible | string>>
                = Reflect.getMetadata('METHOD_INJECTED_DEPS', target) || {};
            if (!methodsDeps[methodName]) {
                methodsDeps[methodName] = {};
            }
            if (token) {
                methodsDeps[methodName][index] = token;
            } else {
                const paramTypes = Reflect.getMetadata('design:paramtypes', target, methodName) || {};
                methodsDeps[methodName][index] = paramTypes[index];
            }
            Reflect.defineMetadata('METHOD_INJECTED_DEPS', methodsDeps, target);

        } else if (token) {
            const deps: Record<number, string> = Reflect.getMetadata('PRE_INJECTED_DEPS', target) || {};
            deps[index] = token;
            Reflect.defineMetadata('PRE_INJECTED_DEPS', deps, target);
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
            const scopes: Record<number, Scopes> = Reflect.getMetadata('DEP_SCOPES', target, methodName) || {};
            scopes[index] = scope;
            Reflect.defineMetadata('DEP_SCOPES', scopes, target, methodName);
        }
        const scopes: Record<number, Scopes> = Reflect.getMetadata('DEP_SCOPES', target) || {};
        scopes[index] = scope;
        Reflect.defineMetadata('DEP_SCOPES', scopes, target);
    };
}
