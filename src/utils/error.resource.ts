import chalk from 'chalk';
import express from 'express';
import { filter, forEach, get } from 'lodash';


export class ErrorResource {
    public url: string;
    public path: string;
    public method: string;
    public name: string;
    public message: string;
    public status: number;
    public data: Record<string, string>;

    constructor(err: Error, req: express.Request) {
        this.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
        this.path = req.path;
        this.method = req.method;
        this.status = get(err, 'status', 500);
        this.message = err.message;
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

    private setData(err: Error): void {
        forEach(
            // get other eventual fields of Error instance
            filter(Object.keys(err), (key: string) => 
                Object.keys(this).indexOf(key) === -1
            ),
            // add value to data error resource field
            (key: string) => this.data[key] = get(err, key)
        );
    }
}
