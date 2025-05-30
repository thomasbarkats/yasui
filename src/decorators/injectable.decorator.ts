import { Scopes } from '../types/enums';


export function Injectable(): ClassDecorator {
    return function (target: Function): void {
        Reflect.defineMetadata('INJECTABLE', true, target);
    };
}

export function Inject(token: string): ParameterDecorator {
    return function (
        target: object,
        propertyKey: string | symbol | undefined,
        index: number
    ): void {
        const deps: Record<number, string> = Reflect.getMetadata('PRE_INJECTED_DEPS', target) || {};
        deps[index] = token;
        Reflect.defineMetadata('PRE_INJECTED_DEPS', deps, target);
    };
}

export function Scope(scope: Scopes): ParameterDecorator {
    return function (
        target: object,
        propertyKey: string | symbol | undefined,
        index: number
    ): void {
        const deps: Record<number, Scopes> = Reflect.getMetadata('DEP_SCOPES', target) || {};
        deps[index] = scope;
        Reflect.defineMetadata('DEP_SCOPES', deps, target);
    };
}
