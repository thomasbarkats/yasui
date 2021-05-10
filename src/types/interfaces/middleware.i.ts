import express from 'express';
import { Constructible, Instance } from './utils.i';


/** middleware type */
export type TMiddleware = Constructible<IMiddleware>;

/** middleware interface */
export interface IMiddleware extends Instance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    use: (...args: any[]) => void | express.Response | Promise<void> | Promise<express.Response>,
}

/** decorated middleware interface */
export interface IDMiddleware extends IMiddleware {
    run: (self: this) => express.RequestHandler,
}
