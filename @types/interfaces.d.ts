import { Application, Request, Response, NextFunction } from 'express';


/** configuration interface for yasui core */
export interface YasuiConfig {
    controllers?: TController[];
    middlewares?: TMiddleware[];
    injections?: Injection<Instance>[];
    environment?: string;
    port?: number | string;
    debug?: boolean;
    apiKey?: string;
    /**
     * If false, disables all validation checks on decorators (unsafe)
     * @default true
     */
    enableDecoratorValidation?: boolean;
}

/** util types */
export declare type Constructible<T = Instance> = {
    new (...args: any[]): T;
}
export declare type Instance = {
    [index: string]: any;
}
export type Injection<T extends Instance> = {
    token: string;
    provide: T;
}

/** controller type */
export type TController = Constructible<IController>;

/** controller instance type */
export type IController = Instance;

/** middleware type */
export declare type TMiddleware = Constructible<IMiddleware>;

/** middleware interface */
export interface IMiddleware {
    use: (...args: any[]) => any,
}

/** express util exports for controllers */
export { Application, Request, Response, NextFunction };
