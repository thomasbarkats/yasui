import { HttpCode } from './enums';
import { ObjectSchema, OpenAPISchema } from './openapi';


/** Error class for custom error handling */
export declare class HttpError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: any;
  /**
   * HTTP status code associated with the error
   * @default 500
   */
  public status?: HttpCode;
  constructor(status: HttpCode, message: string);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ErrorResourceSchema<T extends Record<string, any> = Record<string, any>>(
  /** Additional schema properties to merge with base error schema */
  additionalProperties: Record<string, OpenAPISchema>,
  /** Example object for the combined error schema */
  additionalPropertiesExample?: T,
): ObjectSchema;
