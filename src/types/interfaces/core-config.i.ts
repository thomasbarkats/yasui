import { TController } from './controller.i';
import { TMiddleware } from './middleware.i';
import { Injection } from './utils.i';


export interface CoreConfig {
    controllers?: TController[];
    middlewares?: TMiddleware[];
    injections?: Injection[];
    environment?: string;
    port?: number | string;
    debug?: boolean;
    apiKey?: string;
    enableDecoratorValidation?: boolean;
}
