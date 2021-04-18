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


    public get<T>(name: string): T {
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
        const runningInstance: ClassInstance = this.get(Provided.name);
        if (!runningInstance) {
            this.debug && this.logger.debug(`load ${Provided.name} {${args.length}}`);
            this.instancies[Provided.name] = new Provided(...args);
        }
        return this.get(Provided.name);
    }
}