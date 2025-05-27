import { HttpCode } from '../types/enums';

/** create express method-routing decorator with custom status */
function httpStatusDecorator(): Function {
    return function (
        status: HttpCode,
    ): MethodDecorator {
        /** set status metadata for controller methods */
        return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
            Reflect.defineMetadata('HTTP_STATUS', status, descriptor.value);
            return descriptor;
        };
    };
}

export const HttpStatus = httpStatusDecorator();
