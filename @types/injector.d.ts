import { ClassInstance, Constructible } from './interfaces';
import { LoggerService } from './services';


export const Injector: {
    new(debug?: boolean, logger?: typeof LoggerService): typeof Injector;

    get<T>(name: string): T;
    build<T extends ClassInstance>(Provided: Constructible<T>): T;
};
