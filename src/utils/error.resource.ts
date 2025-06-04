import { italic } from 'kleur';
import { Request } from 'express';

import { HttpCode, HttpCodeMap } from '../types/enums';
import { OpenAPISchema } from '../types/openapi';


export class HttpError extends Error {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
    public status?: HttpCode;

    constructor(status: HttpCode, message: string) {
        super(message);
        this.status = status;
    }
}

export class ErrorResource {
    public url: string;
    public path: string;
    public method: string;
    public name: string;
    public message: string;
    public statusMessage: string;
    public status: HttpCode;
    public data: Record<string, string>;

    constructor(err: HttpError, req: Request) {
        this.url = `${req.protocol}://${req.headers.host}${req.originalUrl}`;
        this.path = req.path;
        this.method = req.method;
        this.status = err.status || HttpCode.INTERNAL_SERVER_ERROR;
        this.statusMessage = HttpCodeMap[this.status] || '';
        this.message = err?.message || '';
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

    private setData(err: HttpError): void {
        /** get other eventual fields of Error extended instance */
        const otherKeys: string[] = Object.keys(err)
            .filter(key => Object.keys(this).indexOf(key) === -1);

        for (const key of otherKeys) {
            /** add value to data error resource field */
            this.data[key] = err[key];
        }
    }
}


/** error schema for Swagger/OpenAPI response decorators */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ErrorResourceSchema<T extends Record<string, any> = Record<string, any>>(
    additionalProperties: Record<string, OpenAPISchema> = {},
    additionalPropertiesExample?: T,
): OpenAPISchema {
    return {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                format: 'uri',
                description: 'Full URL of the request that caused the error',
                example: 'http://localhost:3000/api/tests'
            },
            path: {
                type: 'string',
                description: 'Request path',
                example: '/api/tests'
            },
            method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
                description: 'HTTP method used',
                example: 'PUT'
            },
            name: {
                type: 'string',
                description: 'Error class name',
                example: 'Error'
            },
            message: {
                type: 'string',
                description: 'Error message',
                example: 'I just simulate an error.'
            },
            statusMessage: {
                type: 'string',
                description: 'HTTP status message',
                example: 'Internal Server Error'
            },
            status: {
                type: 'integer',
                minimum: 100,
                maximum: 599,
                description: 'HTTP status code',
                example: 500
            },
            data: {
                type: 'object',
                properties: additionalProperties,
                description: 'Additional error data and extended properties',
                example: {}
            }
        },
        example: {
            url: 'http://localhost:3000/api/tests',
            path: '/api/tests',
            method: 'PUT',
            name: 'Error',
            message: 'I just simulate an error.',
            statusMessage: 'Internal Server Error',
            status: 500,
            data: additionalPropertiesExample || {},
        }
    };
};
