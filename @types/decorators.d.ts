import { TMiddleware } from './interfaces';
import { HttpCode, Scopes } from './enums';
import { OpenAPISchema } from './openapi';


export function Controller(path: string, ...middlewares: TMiddleware[]): ClassDecorator;
export function Middleware(): ClassDecorator;

/** injections related decorators */
export function Injectable(): ClassDecorator;
export function Inject(token: string): ParameterDecorator;
export function Scope(scope: Scopes): ParameterDecorator;

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
export function HttpStatus(status: HttpCode): MethodDecorator;
export function routeRequestParamDecorator(type: string): (varName?: string) => ParameterDecorator;

/** swagger decorators */
export function ApiOperation(summary: string, description?: string, tags?: string[]): MethodDecorator;
export function ApiResponse(statusCode: number, description: string, schema?: OpenAPISchema): MethodDecorator;
export function ApiBody(description?: string, schema?: OpenAPISchema, contentType?: string): MethodDecorator;
export function ApiParam(name: string, description?: string, required?: boolean, schema?: OpenAPISchema): MethodDecorator;
export function ApiQuery(name: string, description?: string, required?: boolean, schema?: OpenAPISchema): MethodDecorator;
export function ApiHeader(name: string, description?: string, required?: boolean, schema?: OpenAPISchema): MethodDecorator;
