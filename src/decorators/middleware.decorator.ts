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

            /** add target instance metadata to bind his args in route function */
            Reflect.defineMetadata('SELF', self, target.prototype);

            return routeHandler(target.prototype, 'use', descriptor);
        };
    };
};
