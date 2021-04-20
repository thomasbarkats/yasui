/* eslint-disable @typescript-eslint/ban-types */

import { Scopes } from '../types/enums';


export function Injectable(): ClassDecorator {
    return function (target: Function): void {
        Reflect.defineMetadata('INJECTABLE', true, target);
    };
}

export function Local(): ParameterDecorator {
    return function (
        target: Object,
        propertyKey: string | symbol,
        index: number
    ): void {
        const deps: Record<number, Scopes> = Reflect.getMetadata('DEPENDENCIES', target) || {};
        deps[index] = Scopes.LOCAL;
        Reflect.defineMetadata(
            'DEPENDENCIES',
            deps,
            target
        );
    };
}
