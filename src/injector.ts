import { yellow } from 'kleur';

import { LoggerService } from './services';
import { InheritedScopes, Scopes } from './types/enums';
import { Instance, Constructible } from './types/interfaces';


export class Injector {
    private instancies: Map<string | symbol, Instance>;
    private logger: LoggerService

    constructor(private debug = false) {
        this.instancies = new Map<string | symbol, Instance>();
        this.logger = new LoggerService();
    }


    public get<T extends Instance>(name: string | symbol): T {
        return this.instancies.get(name) as T;
    }

    /** instantiates constructible by deeply binding dependencies */
    public build<T extends Instance>(
        Provided: Constructible<T>,
        scope: Scopes = Scopes.SHARED
    ): T {
        /** get auto-generated constructor param types meta as dependencies */
        const deps: Constructible[] = Reflect.getMetadata('design:paramtypes', Provided) || [];

        if (Object.keys(this.instancies).length < 1 && deps.length < 1) {
            this.logger.start();
        }

        const token: string | symbol = this.getToken(Provided.name, scope);
        const runningInstance: T = this.get(token);

        if (!runningInstance) {
            const depScopes: Record<number, Scopes> = Reflect.getMetadata('DEP_SCOPES', Provided) || {};
            const depsMap: Record<number, string> = Reflect.getMetadata('DEPENDENCIES', Provided) || {};

            /** build provider dependencies to bind deep-level dependencies */
            const depInstancies: Instance[] = deps.map((Dep: Constructible, index: number) => this.map(
                Dep, /** spread current scope according to its type */
                InheritedScopes.includes(scope) ? scope : depScopes[index],
                depsMap[index]
            ));

            this.register(token, new Provided(...depInstancies));
        }
        return this.get(token);
    }

    public register<T extends Instance>(
        token: string | symbol,
        instance: T,
    ): void {
        this.instancies.set(token, instance);

        if (this.debug) {
            const name: string = (typeof token === 'symbol' && token.description)
                ? yellow(token.description)
                : token.toString();
            this.logger.debug(`register ${name}`);
        }
    }


    /** build sub-dependency or directly map specified injection */
    private map(
        Dep: Constructible,
        scope: Scopes,
        token?: string,
    ): Instance {
        if (token) {
            const instance: Instance = this.get(token);
            if (!instance) {
                throw new Error(`Unregistered dependency ${token}`);
            }
            return instance;
        }
        return this.build(Dep, scope);
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
