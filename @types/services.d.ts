export abstract class log {
    static log(message: string, src?: string, time?: number): void;
    static debug(message: string, src?: string, time?: number): void;
    static success(message: string, src?: string, time?: number): void;
    static error(message: string, src?: string, time?: number): void;
    static warn(message: string, src?: string, time?: number): void;
}

export class timeLog extends log {
    constructor();
    static start(): timeLog;
    stop(): number;
    getTime(): number;
    log(message: string, src?: string): void;
    debug(message: string, src?: string): void;
    success(message: string, src?: string): void;
    error(message: string, src?: string): void;
    warn(message: string, src?: string): void;
}

export abstract class config {
    static get(name: string, backvalue?: string): string;
}
