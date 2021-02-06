import { TController } from './controller.i';
import { TMiddleware } from './middleware.i';


export interface BaseConfig {
    controllers?: TController[],
    middlewares?: TMiddleware[],
    environment?: string;
    port?: number | string;
    debug?: boolean,
    apiKey?: string,
}
