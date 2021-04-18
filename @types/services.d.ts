import kleur from 'kleur';


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
