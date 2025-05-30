import { TController } from './controller.i';
import { TMiddleware } from './middleware.i';
import { Injection, Instance } from './utils.i';


export interface CoreConfig {
    controllers?: TController[];
    middlewares?: TMiddleware[];
    injections?: Injection<Instance>[];
    environment?: string;
    port?: number | string;
    debug?: boolean;
    apiKey?: string;
    enableDecoratorValidation?: boolean;
}
