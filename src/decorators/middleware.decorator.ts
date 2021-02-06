/* eslint-disable @typescript-eslint/ban-types */

import { RequestHandler } from 'express';
import { IMiddleware } from '../types/interfaces';
import { routeHandler } from './methods.decorator';


/** express middleware decorator */
export const Middleware = (): ClassDecorator => {
    return function (target: Function): void {

        target.prototype.run = (self: IMiddleware): RequestHandler => {
            const descriptor = Object.getOwnPropertyDescriptor(target.prototype, 'use');
            if (!descriptor) {
                throw new Error('middleware must implement use() method');
            }

            /** bind target impl to metadata to use this arg in route function */
            Reflect.defineMetadata('SELF', self, target.prototype);

            return routeHandler(target.prototype, 'use', descriptor);
        };
    };
};
