import { ClassInstance, Constructible } from './interfaces';
import { LoggerService } from './services';


export declare class Injector {
    private debug;
    private instancies;
    private logger;
    constructor(debug?: boolean, logger?: LoggerService);
    get<T>(name: string): T;
    build<T extends ClassInstance>(Provided: Constructible<T>): T;
    private bind;
}
