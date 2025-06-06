import express from 'express';
import { Constructible, Instance } from './utils.i';


/** middleware type */
export type TMiddleware = Constructible<IMiddleware>;

/** middleware interface */
export interface IMiddleware extends Instance {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    use: (...args: any[]) => any;
}

/** decorated middleware interface */
export interface IDMiddleware extends IMiddleware {
    run: (self: this) => express.RequestHandler;
}
