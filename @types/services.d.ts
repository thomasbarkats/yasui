import kleur from 'kleur';

export declare class LoggerService {
    /** Timestamp when timer was started (milliseconds) */
    startTime?: number;
    /** Timestamp of the last recorded time point */
    lastTime?: number;
    /** Timestamp when timer was stopped */
    endTime?: number;
    start(): this;
    reset(): this;
    /** Returns elapsed time in milliseconds */
    stop(): number;
    /** Returns current elapsed time without stopping the timer */
    getTime(): number;
    /** Logs message with optional source and custom color using kleur */
    log(message: string, src?: string, color?: kleur.Color): void;
    debug(message: string, src?: string): void;
    success(message: string, src?: string): void;
    error(message: string, src?: string): void;
    warn(message: string, src?: string): void;
}

export declare abstract class ConfigService {
    /**
     * Safe method to read an environment variable
     * @param name environment variable name
     * @param back optional default / fallback value
     */
    static get(name: string, back?: string): string;
}
