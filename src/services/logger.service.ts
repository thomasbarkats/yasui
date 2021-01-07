/* eslint-disable no-console */

import chalk from 'chalk';


export abstract class LoggerService {
    
    public static log(message: string, src?: string, time?: number): void {
        console.log(LoggerService.getText(message, src, time));
    }

    public static debug(message: string, src?: string, time?: number): void {
        src = src ? `${src}(debug)` : 'app(debug)';
        console.log(LoggerService.getText(message, chalk.cyan(src), time));
    }

    public static success(message: string, src?: string, time?: number): void {
        console.log(chalk.green(LoggerService.getText(message, src, time)));
    }

    public static error(message: string, src?: string, time?: number): void {
        console.error(chalk.red(LoggerService.getText(message, src, time)));
    }

    public static warn(message: string, src?: string, time?: number): void {
        console.warn(chalk.yellow(LoggerService.getText(message, src, time)));
    }

    private static getDate(): string {
        const date: Date = new Date();
        return chalk.gray(`[${date.toISOString()}]`);
    }

    private static getText(message: string, src?: string, time?: number): string {
        const text = `${LoggerService.getDate()} ${chalk.bold(src ? src : 'app')}: ${message}`;
        if (time !== undefined) {
            return text + chalk.gray(` +${time.toString()}ms`);
        }
        return text;
    }
}

export class TimeLoggerService extends LoggerService {
    public startTime: number;
    public lastTime: number;
    public endTime: number | undefined;

    constructor() {
        super();
        this.startTime = new Date().getTime();
        this.lastTime = this.startTime;
    }

    public static start(): TimeLoggerService {
        return new this();
    }

    public stop(): number {
        this.endTime = new Date().getTime();
        return this.endTime - this.startTime;
    }

    public getTime(): number {
        const currentTime: number = new Date().getTime();
        const timeDiff: number = currentTime - this.lastTime;
        this.lastTime = currentTime;
        return timeDiff;
    }

    public log(message: string, src?: string): void {
        LoggerService.log(message, src, this.getTime());
    }

    public debug(message: string, src?: string): void {
        LoggerService.debug(message, src, this.getTime());
    }

    public success(message: string, src?: string): void {
        LoggerService.success(message, src, this.getTime());
    }

    public error(message: string, src?: string): void {
        LoggerService.error(message, src, this.getTime());
    }

    public warn(message: string, src?: string): void {
        LoggerService.warn(message, src, this.getTime());
    }
}
