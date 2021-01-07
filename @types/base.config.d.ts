/* eslint-disable @typescript-eslint/no-explicit-any */

export interface YasuiConfig {
    controllers?: any[],
    middlewares?: any[],
    environment?: string;
    port?: number;
    debug?: boolean,
    apiKey?: string,
}
