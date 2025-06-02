import { yellow } from 'kleur';

import { LoggerService } from './services';
import { InheritedScopes, Scopes } from './types/enums';
import { Instance, Constructible } from './types/interfaces';
import { DecoratorValidator } from './utils/decorator-validator';


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

        /** get auto-generated constructor param types meta as dependencies */
        const deps: Constructible[] = Reflect.getMetadata('design:paramtypes', Provided) || [];

        const depScopes: Record<number, Scopes> = Reflect.getMetadata('DEP_SCOPES', Provided) || {};
        const preInjectedDeps: Record<number, string> = Reflect.getMetadata('PRE_INJECTED_DEPS', Provided) || {};

        this.buildStack.add(className);

        try {
            /** build provider dependencies to bind deep-level dependencies */
            const depInstancies: Instance[] = deps.map((Dep: Constructible, index: number) =>
                this.buildDependency(
                    Dep,
                    /** spread current scope according to its type */
                    InheritedScopes.includes(scope)
                        ? scope
                        : (depScopes[index] || Scopes.SHARED),
                    preInjectedDeps[index]
                )
            );
            this.register(token, new Provided(...depInstancies));
        } finally {
            this.buildStack.delete(className);
        }

        return this.get(token);
    }

    public register<T>(
        token: string | symbol,
        instance: T
    ): void {
        this.registry.set(token, instance);

        if (this.debug) {
            const name: string = (typeof token === 'symbol' && token.description)
                ? yellow(token.description)
                : token.toString();
            this.logger.debug(`register ${name}`);
        }
    }


    /** build sub-dependency or directly map specified injection */
    private buildDependency(
        Dep: Constructible,
        scope: Scopes,
        preRegisteredToken?: string
    ): Instance {
        this.decoratorValidator?.validateInjectable(
            Dep,
            scope,
            this.buildStack,
        );
        return preRegisteredToken
            ? this.get(preRegisteredToken)
            : this.build(Dep, scope);
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
