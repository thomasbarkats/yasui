import express from 'express';


/** middleware type */
export interface TMiddleware extends Function {
    new (): IMiddleware;
}

/** middleware interface */
export interface IMiddleware {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    use: (...args: any[]) => void | express.Response,
}
