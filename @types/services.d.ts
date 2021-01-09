export const logger: {
    startTime?: number;
    lastTime?: number;
    endTime?: number;

    start(): typeof logger;
    reset(): typeof logger;
    stop(): number;
    getTime(): number;

    log(message: string, src?: string): void;
    debug(message: string, src?: string): void;
    success(message: string, src?: string): void;
    error(message: string, src?: string): void;
    warn(message: string, src?: string): void;
};

export const config: {
    get(name: string, backvalue?: string): string;
};
