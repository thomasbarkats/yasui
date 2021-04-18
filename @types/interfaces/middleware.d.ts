import express from 'express';
import { Constructible } from './utils';


/** middleware type */
export type TMiddleware = Constructible<IMiddleware>;

/** middleware interface */
export interface IMiddleware {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    use: (...args: any[]) => void | express.Response,
}
