import { HttpCode } from '~types/enums';

/** create express method-routing decorator with custom status */
export function HttpStatus(status: HttpCode): MethodDecorator {
    return function (
        target: object,
        propertyKey: string | symbol,
    ): void {
        Reflect.defineMetadata('HTTP_STATUS', status, target, propertyKey);
    };
}
