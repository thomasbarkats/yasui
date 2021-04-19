/* eslint-disable @typescript-eslint/no-explicit-any */

export declare type Constructible<T = Instance> = {
    new (...args: any[]): T;
}

export declare type Instance = {
    [index: string]: any;
}
