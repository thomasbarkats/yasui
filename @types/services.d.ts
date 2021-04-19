import kleur from 'kleur';
import { ClassInstance, Constructible } from './interfaces/utils';


export declare class LoggerService {
    startTime?: number;
    lastTime?: number;
    endTime?: number;
    start(): this;
    reset(): this;
    stop(): number;
    getTime(): number;
    log(message: string, src?: string, color?: kleur.Color): void;
    debug(message: string, src?: string): void;
    success(message: string, src?: string): void;
    error(message: string, src?: string): void;
    warn(message: string, src?: string): void;
    private getDate;
    private getText;
}

export declare abstract class ConfigService {
    static get(name: string, back?: string): string;
}

export declare class Injector {
    private debug;
    private instancies;
    private logger;
    constructor(debug?: boolean);
    get<T extends ClassInstance>(name: string): T;
    build<T extends ClassInstance>(Provided: Constructible<T>): T;
    private bind;
}
