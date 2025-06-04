/* eslint-disable @typescript-eslint/no-explicit-any */

import { HttpCode } from '../enums';


export type Constructible<T = Instance> = {
    new (...args: any[]): T;
}

export type Instance = {
    [index: string]: any;
}

export type Injection<T = any> = {
    token: string;
    provide: T;
}


export interface HttpError extends Error {
    [index: string]: any;
    status?: HttpCode;
}
