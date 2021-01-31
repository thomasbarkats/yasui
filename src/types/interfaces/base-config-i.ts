/* eslint-disable @typescript-eslint/ban-types */


export interface BaseConfig {
    controllers?: Function[],
    middlewares?: Function[],
    environment?: string;
    port?: number | string;
    debug?: boolean,
    apiKey?: string,
}
