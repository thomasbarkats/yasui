import { RequestHandler } from 'express';

export function Controller(path: string, ...middlewares: RequestHandler[]): ClassDecorator;
export function Get(path: string, ...middlewares: RequestHandler[]): MethodDecorator;
export function Post(path: string, ...middlewares: RequestHandler[]): MethodDecorator;
export function Put(path: string, ...middlewares: RequestHandler[]): MethodDecorator;
export function Delete(path: string, ...middlewares: RequestHandler[]): MethodDecorator;
export function Patch(path: string, ...middlewares: RequestHandler[]): MethodDecorator;
