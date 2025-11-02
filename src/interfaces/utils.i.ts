/* eslint-disable @typescript-eslint/no-explicit-any */

/** Utility type for unknown Promise */
export type MaybePromise<T> = T | Promise<T>;

/** Valid JSON values for API responses */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

/** Utility type for an instantiable class */
export type Constructible<T = Instance> = {
  new(...args: any[]): T;
};

/** Generic type for a class instance */
export type Instance = {
  [index: string]: any;
};

/** Define a custom injection for YasuiJS configuration - See `@Inject` and `@Injectable` */
export type Injection<T = any> = {
  token: string;
  provide: T;
};
