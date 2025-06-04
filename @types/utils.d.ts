import { OpenAPISchema } from './openapi';


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ErrorResourceSchema<T extends Record<string, any> = Record<string, any>>(
    additionalProperties: Record<string, OpenAPISchema>,
    additionalPropertiesExample?: T,
): OpenAPISchema;
