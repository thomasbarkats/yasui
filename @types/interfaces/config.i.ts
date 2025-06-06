import { TController } from './controller.i';
import { TMiddleware } from './middleware.i';
import { Injection } from './utils.i';


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
        /**
         * Whether to generate swagger documentation
         * @default false
         */
        generate: boolean;
        /**
         * Output path for generated swagger documentation
         * @default /api-docs
         */
        path?: string;
        info?: {
            title?: string;
            version?: string;
            description?: string;
        };
    };
}
