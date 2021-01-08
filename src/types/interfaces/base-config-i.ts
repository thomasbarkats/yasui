import { RequestHandler } from 'express';


export interface BaseConfig {
    // eslint-disable-next-line @typescript-eslint/ban-types
    controllers?: Function[],
    middlewares?: RequestHandler[],
    environment?: string;
    port?: number;
    debug?: boolean,
    apiKey?: string,
}
