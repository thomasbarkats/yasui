/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';


/** configuration interface for yasui core */
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
    use: (...args: any[]) => void | express.Response | Promise<void> | Promise<express.Response>,
}

/** express util exports for controllers, to avoid install it */
export type ExpressApplication = express.Application;
export type Response = express.Response;
export type Request = express.Request;
export type NextFunction = express.NextFunction;
