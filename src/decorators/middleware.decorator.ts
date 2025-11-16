import { RequestHandler } from '../web.js';
import { routeHandler } from '../utils/route-handler.js';
import { ReflectMetadata, defineMetadata, getMetadata } from '../utils/reflect.js';
import { IMiddleware } from '../interfaces/index.js';


/** Define a Middleware */
export function Middleware(): ClassDecorator {
  return function (target: Function): void {

    const params = getMetadata(ReflectMetadata.PARAMS, target.prototype, 'use') || [];

    /** check if middleware needs logger (once during decoration for performance) */
    const useLogger = params.some(p => p.path.includes('_logger'));
    defineMetadata(ReflectMetadata.USE_LOGGER, useLogger, target.prototype);

    target.prototype.run = (self: IMiddleware): RequestHandler => {
      const descriptor = Object.getOwnPropertyDescriptor(target.prototype, 'use');
      if (!descriptor) {
        throw new Error('middleware must implement use() method');
      }

      /** add target instance metadata to bind his args in route function */
      defineMetadata(ReflectMetadata.SELF, self, target.prototype);

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
