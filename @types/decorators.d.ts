/* eslint-disable @typescript-eslint/ban-types */

export function Controller(path: string, ...middlewares: Function[]): ClassDecorator;

export function Middleware(): MethodDecorator;
export function Get(path: string, ...middlewares: Function[]): MethodDecorator;
export function Post(path: string, ...middlewares: Function[]): MethodDecorator;
export function Put(path: string, ...middlewares: Function[]): MethodDecorator;
export function Delete(path: string, ...middlewares: Function[]): MethodDecorator;
export function Patch(path: string, ...middlewares: Function[]): MethodDecorator;

export function Req(): ParameterDecorator;
export function Res(): ParameterDecorator;
export function Next(): ParameterDecorator;
export function Header(varName?: string): ParameterDecorator;
export function Param(varName?: string): ParameterDecorator;
export function Query(varName?: string): ParameterDecorator;
export function Body(varName?: string): ParameterDecorator;
