import chalk from 'chalk';
import express from 'express';


export interface IEError extends Error {
    status?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
}

export class ErrorResource {
    public url: string;
    public path: string;
    public method: string;
    public name: string;
    public message: string;
    public status: number;
    public data: Record<string, string>;

    constructor(err: IEError, req: express.Request) {
        this.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
        this.path = req.path;
        this.method = req.method;
        this.status = err.status || 500;
        this.message = err.message || '';
        this.name = err.constructor.name;

        this.data = {};
        this.setData(err);
    }

    public toString(): string {
        return `url: ${this.url}\n` +
            `request: ${chalk.italic(`${this.method} ${this.path}`)}\n` +
            `status: ${this.status}\n` +
            `message: ${this.message}\n` +
            `data: ${JSON.stringify(this.data, null, 2)}`;
    }

    private setData(err: IEError): void {
        /** get other eventual fields of Error extented instance */
        const otherKeys: string[] = Object.keys(err)
            .filter(key => Object.keys(this).indexOf(key) === -1);

        for (const key in otherKeys) {
            /** add value to data error resource field */
            this.data[key] = err[key];
        }
    }
}
