/* eslint-disable @typescript-eslint/no-explicit-any */

export declare type Constructible<T = ClassInstance> = {
    new (...args: any[]): T;
}

export declare type ClassInstance = {
    [index: string]: any;
}
