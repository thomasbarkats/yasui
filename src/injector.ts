import { LoggerService } from './services';
import { Instance, Constructible } from './types/interfaces';


export class Injector {
    private instancies: Record<string, Instance>;
    private logger: LoggerService

    constructor(private debug = false) {
        this.instancies = {};
        this.logger = new LoggerService();
    }


    public get<T extends Instance>(name: string): T {
        return this.instancies[name] as T;
    }

    /** instantiates constructible by deeply binding dependencies */
    public build<T extends Instance>(
        Provided: Constructible<T>
    ): T {
        /** get auto-generated constructor param types meta as dependencies */
        const deps: Constructible[] = Reflect.getMetadata('design:paramtypes', Provided);

        if (Object.keys(this.instancies).length < 1 && !deps) {
            this.logger.start();
        }

        let depInstancies: Instance[] = [];
        if (deps) {
            /** build provider dependencies to bind deep-level deps. */
            depInstancies = deps.map((Dep: Constructible) => this.build(Dep));
        }
        try {
            return this.bind(Provided, depInstancies);
        } catch (err) {
            this.logger.error(`failed to load ${Provided.name || '<invalid constructible>'}\n${err}`);
            throw err;
        }
    }


    private bind<T extends Instance>(
        Provided: Constructible<T>,
        args: Instance[]
    ): T {
        const runningInstance: T = this.get(Provided.name);

        if (!runningInstance) {
            /** register provider instance */
            this.instancies[Provided.name] = new Provided(...args);

            this.debug && this.logger.debug(`bind ${Provided.name} {${args.length}}`);
        }
        return this.get(Provided.name);
    }
}
