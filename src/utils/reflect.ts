import { ReflectTypes } from '~types/enums';


export function getMetadata<K extends keyof ReflectTypes>(
  key: K,
  target: object,
  propertyKey?: string | symbol
): ReflectTypes[K] | undefined {
  return propertyKey
    ? Reflect.getMetadata(key, target, propertyKey)
    : Reflect.getMetadata(key, target);
}

export function defineMetadata<K extends keyof ReflectTypes>(
  key: K,
  metadataValue: ReflectTypes[K],
  target: object,
  propertyKey?: string | symbol
): void {
  return propertyKey
    ? Reflect.defineMetadata(key, metadataValue, target, propertyKey)
    : Reflect.defineMetadata(key, metadataValue, target);
}
