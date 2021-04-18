import { TMiddleware } from './interfaces';


export function Controller(path: string, ...middlewares: TMiddleware[]): ClassDecorator;
export function Middleware(): ClassDecorator;
export function Injectable(): ClassDecorator;

/** controller route-methods decorators */
export function Get(path: string, ...middlewares: TMiddleware[]): MethodDecorator;
export function Post(path: string, ...middlewares: TMiddleware[]): MethodDecorator;
export function Put(path: string, ...middlewares: TMiddleware[]): MethodDecorator;
export function Delete(path: string, ...middlewares: TMiddleware[]): MethodDecorator;
export function Patch(path: string, ...middlewares: TMiddleware[]): MethodDecorator;

/** route parameters decorators */
export function Req(): ParameterDecorator;
export function Res(): ParameterDecorator;
export function Next(): ParameterDecorator;
export function Header(varName?: string): ParameterDecorator;
export function Param(varName?: string): ParameterDecorator;
export function Query(varName?: string): ParameterDecorator;
export function Body(varName?: string): ParameterDecorator;
export function Logger(): ParameterDecorator;
