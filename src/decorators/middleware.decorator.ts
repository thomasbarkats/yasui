import { RequestHandler } from 'express';
import { routeHandler } from '../utils/route-handler.js';
import { ReflectMetadata, defineMetadata, getMetadata } from '../utils/reflect.js';
import { IMiddleware } from '../interfaces/index.js';


/** Define a Middleware */
export function Middleware(): ClassDecorator {
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
        target,
        descriptor,
        params,
        [],
        true
      );
    };
  };
};
