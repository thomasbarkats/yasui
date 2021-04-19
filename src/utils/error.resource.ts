import { italic } from 'kleur';
import express from 'express';
import { HttpStatus, HttpStatusMap } from '../types/enums';


/** extended error interface */
export interface IEError extends Error {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any,
    status?: number,
}


export class ErrorResource {
    public url: string;
    public path: string;
    public method: string;
    public name: string;
    public message: string;
    public statusMessage: string;
    public status: number;
    public data: Record<string, string>;

    constructor(err: IEError, req: express.Request) {
        this.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
        this.path = req.path;
        this.method = req.method;
        this.status = err.status || HttpStatus.INTERNAL_SERVER_ERROR;
        this.statusMessage = HttpStatusMap[this.status];
        this.message = err.message;
        this.name = err.constructor.name;

        this.data = {};
        this.setData(err);
    }


    public toString(): string {
        return `url: ${this.url}\n` +
            `request: ${italic(`${this.method} ${this.path}`)}\n` +
            `status: ${this.status} (${this.statusMessage})\n` +
            `message: ${this.message}\n` +
            `data: ${JSON.stringify(this.data, null, 2)}`;
    }

    private setData(err: IEError): void {
        /** get other eventual fields of Error extended instance */
        const otherKeys: string[] = Object.keys(err)
            .filter(key => Object.keys(this).indexOf(key) === -1);

        for (const key in otherKeys) {
            /** add value to data error resource field */
            this.data[key] = err[key];
        }
    }
}
