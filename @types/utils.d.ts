import { HttpCode } from './enums';
import { ApiPropertyDefinition } from './interfaces';
import { OpenAPISchema } from './openapi';


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

/** Returns a reference OpenAPI schema for a given resource */
export function resolveSchema(schema: ApiPropertyDefinition): OpenAPISchema;
