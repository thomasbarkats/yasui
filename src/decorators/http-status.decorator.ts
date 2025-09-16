import { HttpCode } from '../enums/index.js';
import { ReflectMetadata, defineMetadata } from '../utils/reflect.js';


/** Sets default HTTP status code for the response (e.g., 201 for CREATED) */
export function HttpStatus(status: HttpCode): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
  ): void {
    defineMetadata(ReflectMetadata.HTTP_STATUS, status, target, propertyKey);
  };
}
