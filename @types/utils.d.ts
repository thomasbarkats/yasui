import { HttpCode } from './enums';
import { OpenAPISchema } from './openapi';


/** error class for custom error handling */
export declare class HttpError extends Error {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [index: string]: any;
    public status?: HttpCode;
    constructor(status: HttpCode, message: string);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ErrorResourceSchema<T extends Record<string, any> = Record<string, any>>(
    additionalProperties: Record<string, OpenAPISchema>,
    additionalPropertiesExample?: T,
): OpenAPISchema;
