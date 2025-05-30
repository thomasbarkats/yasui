import { TController } from './controller.i';
import { TMiddleware } from './middleware.i';
import { Injection } from './utils.i';


export interface CoreConfig {
    controllers?: TController[];
    middlewares?: TMiddleware[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    injections?: Injection<any>[];
    environment?: string;
    port?: number | string;
    debug?: boolean;
    apiKey?: string;
    enableDecoratorValidation?: boolean;
}
