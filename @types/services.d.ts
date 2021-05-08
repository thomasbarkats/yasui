import kleur from 'kleur';
import { Instance, Constructible } from './interfaces';
import { Scopes } from './enums';


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
}

export declare abstract class ConfigService {
    static get(name: string, back?: string): string;
}

export declare class Injector {
    constructor(debug?: boolean);
    get<T extends Instance>(name: string | symbol): T;
    build<T extends Instance>(Provided: Constructible<T>, scope?: Scopes): T;
    register<T extends Instance>(token: string | symbol, instance: T): void;
}
