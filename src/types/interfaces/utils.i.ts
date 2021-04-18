/* eslint-disable @typescript-eslint/no-explicit-any */

export type Constructible<T = ClassInstance> = {
    new (...args: any[]): T;
}

export type ClassInstance = {
    [index: string]: any;
}
