import { TMiddleware } from './interfaces';
import { HttpCode, Scopes } from './enums';
import { OpenAPISchema } from './openapi';


export function Controller(path: string, ...middlewares: TMiddleware[]): ClassDecorator;
export function Middleware(): ClassDecorator;


// --- Injections related decorators ---

export function Injectable(): ClassDecorator;
/** Injects dependency by token name */
export function Inject(token: string): ParameterDecorator;
export function Scope(scope: Scopes): ParameterDecorator;


// --- Controller route-methods decorators ---

export function Get(path: string, ...middlewares: TMiddleware[]): MethodDecorator;
export function Post(path: string, ...middlewares: TMiddleware[]): MethodDecorator;
export function Put(path: string, ...middlewares: TMiddleware[]): MethodDecorator;
export function Delete(path: string, ...middlewares: TMiddleware[]): MethodDecorator;
export function Patch(path: string, ...middlewares: TMiddleware[]): MethodDecorator;


// --- Route parameters decorators ---

/** Injects Express request object */
export function Req(): ParameterDecorator;
/** Injects Express response object */
export function Res(): ParameterDecorator;
/** Injects Express next function */
export function Next(): ParameterDecorator;
/** Extracts specific header or entire headers object if varName omitted */
export function Header(varName?: string): ParameterDecorator;
/** Extracts specific path parameter or all params if varName omitted */
export function Param(varName?: string): ParameterDecorator;
/** Extracts specific query parameter or entire query object if varName omitted */
export function Query(varName?: string): ParameterDecorator;
/** Extracts specific body property or entire body if varName omitted */
export function Body(varName?: string): ParameterDecorator;
/** Injects timed logger instance dedicated to the current request */
export function Logger(): ParameterDecorator;
/** Sets default HTTP status code for the response (e.g., 201 for CREATED) */
export function HttpStatus(status: HttpCode): MethodDecorator;
/** Factory function for creating parameter decorators that extract request data */
export function routeRequestParamDecorator(type: string): (varName?: string) => ParameterDecorator;


// --- Swagger decorators ---

/** Documents API endpoint with summary, description and tags */
export function ApiOperation(summary: string, description?: string, tags?: string[]): MethodDecorator;
/** Documents API response with status code, description and schema */
export function ApiResponse(statusCode: number, description: string, schema?: OpenAPISchema): MethodDecorator;
/**
 * Documents request body schema and content type
 * @default contentType "application/json"
 */
export function ApiBody(description?: string, schema?: OpenAPISchema, contentType?: string): MethodDecorator;
/**
 * Documents path parameter with validation schema
 * @default required false
 */
export function ApiParam(name: string, description?: string, required?: boolean, schema?: OpenAPISchema): MethodDecorator;
/**
 * Documents query parameter with validation schema
 * @default required false
 */
export function ApiQuery(name: string, description?: string, required?: boolean, schema?: OpenAPISchema): MethodDecorator;
/**
 * Documents header parameter with validation schema
 * @default required false
 */
export function ApiHeader(name: string, description?: string, required?: boolean, schema?: OpenAPISchema): MethodDecorator;
