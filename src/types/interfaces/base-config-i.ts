import { TController } from './controller.i';


export interface BaseConfig {
    controllers?: TController[],
    // eslint-disable-next-line @typescript-eslint/ban-types
    middlewares?: Function[],
    environment?: string;
    port?: number | string;
    debug?: boolean,
    apiKey?: string,
}
