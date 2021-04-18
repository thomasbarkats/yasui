import kleur from 'kleur';


export const LoggerService: {
    startTime?: number;
    lastTime?: number;
    endTime?: number;

    new(): typeof LoggerService;

    start(): typeof LoggerService;
    reset(): typeof LoggerService;
    stop(): number;
    getTime(): number;

    log(message: string, src?: string, color?: kleur.Color): void;
    debug(message: string, src?: string): void;
    success(message: string, src?: string): void;
    error(message: string, src?: string): void;
    warn(message: string, src?: string): void;
};

export const ConfigService: {
    get(name: string, back?: string): string;
};
