import { HttpCode, ReflectMetadata } from '~types/enums';
import { defineMetadata } from '../utils/reflect';

/** create express method-routing decorator with custom status */
export function HttpStatus(status: HttpCode): MethodDecorator {
  return function (
    target: object,
    propertyKey: string | symbol,
  ): void {
    defineMetadata(ReflectMetadata.HTTP_STATUS, status, target, propertyKey);
  };
}
