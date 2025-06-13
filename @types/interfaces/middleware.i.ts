import { RequestHandler } from 'express';
import { Constructible, Instance } from './utils.i';


/** Middleware type */
export type TMiddleware = Constructible<IMiddleware> | RequestHandler;

/** Middleware interface */
export interface IMiddleware extends Instance {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  use: (...args: any[]) => any;
}

/** Decorated middleware interface */
export interface IDMiddleware extends IMiddleware {
  run: (self: this) => RequestHandler;
}
