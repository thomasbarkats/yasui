/* eslint-disable no-redeclare */
/* eslint-disable max-len */

import { Constructible, ApiPropertyDefinition, TMiddleware, IPipeTransform } from './interfaces';
import { HttpCode, Scopes } from './enums';
import { HttpError } from './utils';


export function Controller(path: string, ...middlewares: TMiddleware[]): ClassDecorator;
export function Middleware(): ClassDecorator;
export function PipeTransform(): ClassDecorator;

/** Applies pipes to all routes in the controller or a specific one (use to transform/validate route params) */
export function UsePipes(...pipes: Constructible<IPipeTransform>[]): ClassDecorator & MethodDecorator;


// --- Injections related decorators ---

/**
 * Mark a class as injectable —
 * Required to detect dependency injection through class constructor parameter types
 */
export function Injectable(): ClassDecorator;
/**
 * Injects a dependency by token or auto-inferred type —
 * Usage:
 * - Class constructor parameters: Only needed for custom token injection
 * - Controller/middleware method parameters: Required for any dependency injection
 */
export function Inject(token?: string): ParameterDecorator;
/**
 * Define scope of dependency injection
 * - SHARED (default): Use singleton instance shared across the application
 * - LOCAL: New instance the injection context
 * - DEEP_LOCAL: New instance, propagates locality to its own dependencies
 */
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

/** Documents API endpoint */
export function ApiOperation(summary: string, description?: string, tags?: string[]): MethodDecorator;
/** Documents API response */
export function ApiResponse(statusCode: number, description: string, definition?: ApiPropertyDefinition): MethodDecorator;
/** Documents API response with class reference only (description will be the schema name) */
export function ApiResponse(statusCode: number, ClassRef: Constructible): MethodDecorator;
/** Documents API error response with base error schema and custom properties schema (record or class reference) */
export function ApiErrorResponse<T extends HttpError>(statusCode: number, description: string, ErrorDataClass?: Constructible<T>): MethodDecorator;
/** Documents API error response with class reference only for custom properties (description will be the schema name) */
export function ApiErrorResponse<T extends HttpError>(statusCode: number, ErrorDataClass?: Constructible<T>): MethodDecorator;
/** Defines property for a class API schema
 *  @default schema.required true */
export function ApiProperty(definition?: ApiPropertyDefinition): PropertyDecorator;
/** Alias for '@ApiProperty()` */
export function AP(definition?: ApiPropertyDefinition): PropertyDecorator;
/** Defines non-required property for a class API schema */
export function ApiPropertyOptional(definition?: ApiPropertyDefinition): PropertyDecorator;
/** Alias for `@ApiPropertyOptional()` */
export function APO(definition?: ApiPropertyDefinition): PropertyDecorator;
/** Defines custom name for a class API schema
 *  @default name Class.name // if non-decorated */
export function ApiSchema(name: string): ClassDecorator;
/** Documents request body schema and content type
 *  @default contentType "application/json" */
export function ApiBody(description?: string, definition?: ApiPropertyDefinition, contentType?: string): MethodDecorator;
/** Documents request body with class reference only (description will be the schema name, contentType "application/json") */
export function ApiBody(ClassRef: Constructible): MethodDecorator;
/** Documents path parameter with validation schema
 *  @default required false */
export function ApiParam(name: string, description?: string, required?: boolean, definition?: ApiPropertyDefinition): MethodDecorator;
/** Documents query parameter with validation schema
 *  @default required false */
export function ApiQuery(name: string, description?: string, required?: boolean, definition?: ApiPropertyDefinition): MethodDecorator;
/** Documents header parameter with validation schema
 *  @default required false */
export function ApiHeader(name: string, description?: string, required?: boolean, definition?: ApiPropertyDefinition): MethodDecorator;
