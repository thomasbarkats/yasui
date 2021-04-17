import express from 'express';


/** middleware type */
export type TMiddleware = {
    new (): IMiddleware;
}

/** middleware interface */
export interface IMiddleware {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    use: (...args: any[]) => void | express.Response,
}

/** middleware decorated interface */
export interface IDMiddleware extends IMiddleware {
    run: (self: this) => express.RequestHandler,
}
