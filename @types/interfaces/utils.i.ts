/* eslint-disable @typescript-eslint/no-explicit-any */

export type Constructible<T = Instance> = {
    new (...args: any[]): T;
};

export type Instance = {
    [index: string]: any;
};

export type Injection<T = any> = {
    token: string;
    provide: T;
};
