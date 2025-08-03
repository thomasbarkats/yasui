import { RequestHandler } from 'express';

import { IMiddleware } from '~types/interfaces';
import { routeHandler } from './methods.decorator';
import { ReflectMetadata } from '~types/enums';
import { defineMetadata, getMetadata } from '../utils/reflect';


/** express middleware decorator */
export const Middleware = (): ClassDecorator => {
  return function (target: Function): void {

    target.prototype.run = (self: IMiddleware): RequestHandler => {
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, 'use');
      if (!descriptor) {
        throw new Error('middleware must implement use() method');
      }

      /** add target instance metadata to bind his args in route function */
      defineMetadata(ReflectMetadata.SELF, self, target.prototype);

      const params = getMetadata(ReflectMetadata.PARAMS, target.prototype, 'use') || [];

      return routeHandler(
        target.prototype,
        descriptor,
        params,
        true
      );
    };
  };
};
