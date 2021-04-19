/* eslint-disable @typescript-eslint/no-explicit-any */

export type Constructible<T = Instance> = {
    new (...args: any[]): T;
}

export type Instance = {
    [index: string]: any;
}
