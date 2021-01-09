import { RequestHandler } from 'express';
import { IController } from '.';


export interface BaseConfig {
    controllers?: IController[],
    middlewares?: RequestHandler[],
    environment?: string;
    port?: number;
    debug?: boolean,
    apiKey?: string,
}
