/* eslint-disable @typescript-eslint/no-explicit-any */

export function Controller(path: string, ...middlewares: any[]): ClassDecorator;
export function Get(path: string, ...middlewares: any[]): MethodDecorator;
export function Post(path: string, ...middlewares: any[]): MethodDecorator;
export function Put(path: string, ...middlewares: any[]): MethodDecorator;
export function Delete(path: string, ...middlewares: any[]): MethodDecorator;
export function Patch(path: string, ...middlewares: any[]): MethodDecorator;
