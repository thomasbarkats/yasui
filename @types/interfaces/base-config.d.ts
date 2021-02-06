import { TController } from './controller';
import { TMiddleware } from './middleware';


export interface BaseConfig {
    controllers?: TController[],
    middlewares?: TMiddleware[],
    environment?: string;
    port?: number | string;
    debug?: boolean,
    apiKey?: string,
}
