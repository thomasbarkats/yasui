import { Injectable } from './injectable.decorator.js';
import { ReflectMetadata, defineMetadata } from '../utils/reflect.js';
import { IPipeTransform, Constructible } from '../interfaces/index.js';


/** Define a Pipe-transform */
export const PipeTransform = Injectable;

/** Applies pipes to all routes in the controller or a specific one (use to transform/validate route params) */
export function UsePipes(...pipes: Constructible<IPipeTransform>[]): ClassDecorator & MethodDecorator {
  return function (
    target: object | Function,
    propertyKey?: string | symbol,
    descriptor?: PropertyDescriptor
  ): void {
    if (propertyKey && descriptor) {
      defineMetadata(ReflectMetadata.PIPES, pipes, target, propertyKey);
    } else {
      defineMetadata(ReflectMetadata.PIPES, pipes, (<Function>target).prototype);
    }
  };
}
