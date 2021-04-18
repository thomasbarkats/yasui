import { LoggerService } from './services';
import { ClassInstance, Constructible } from './types/interfaces';


export class Injector {
    private instancies: Record<string, ClassInstance>;
    private logger: LoggerService

    constructor(
        private debug = false,
        logger?: LoggerService,
    ) {
        this.instancies = {};
        this.logger = logger || new LoggerService();
    }


    public get<T extends ClassInstance>(name: string): T {
        return this.instancies[name] as T;
    }

    /** instantiates constructible by deeply binding dependencies */
    public build<T extends ClassInstance>(
        Provided: Constructible<T>
    ): T {
        /** get auto-generated constructor param types meta as dependencies */
        const depTypes: Constructible[] = Reflect.getMetadata('design:paramtypes', Provided);

        let depInstancies: ClassInstance[] = [];
        if (depTypes) {
            depInstancies = depTypes.map((Dep: Constructible) => this.build(Dep));
        }
        try {
            return this.bind(Provided, depInstancies);
        } catch (err) {
            this.logger.error(`failed to load ${Provided.name || '<invalid constructible>'}\n${err}`);
            throw err;
        }
    }


    private bind<T extends ClassInstance>(
        Provided: Constructible<T>,
        args: ClassInstance[]
    ): T {
        const runningInstance: T = this.get(Provided.name);
        if (!runningInstance) {
            this.instancies[Provided.name] = new Provided(...args);
            this.debug && this.logger.debug(`bind ${Provided.name} {${args.length}}`);
        }
        return this.get(Provided.name);
    }
}
