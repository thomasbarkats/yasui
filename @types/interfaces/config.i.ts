import { TController } from './controller.i';
import { TMiddleware } from './middleware.i';
import { Injection } from './utils.i';


/** configuration interface for yasui core */
export interface YasuiConfig {
    controllers?: TController[];
    middlewares?: TMiddleware[];
    /** Pre-registered customs injections */
    injections?: Injection[];
    environment?: string;
    /**
     * Listening port of your server
     * @default 3000
     */
    port?: number | string;
    /**
     * If true, display more logs and logs all incoming requests
     * @default false
     */
    debug?: boolean;
    /** Optional required API key for all requests */
    apiKey?: string;
    /**
     * If false, disables all validation checks on decorators (unsafe)
     * @default true
     */
    enableDecoratorValidation?: boolean;
    swagger?: {
        generate: boolean;
        path?: string;
        info?: {
            title?: string;
            version?: string;
            description?: string;
        };
    };
}
