/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';


/** configuration for yasui core */
export interface YasuiConfig {
    controllers?: TController[],
    middlewares?: TMiddleware[],
    injections?: Injection<Instance>[],
    environment?: string;
    port?: number | string;
    debug?: boolean,
    apiKey?: string,
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
    use: (...args: any[]) => void | express.Response,
}
