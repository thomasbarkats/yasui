import { SwaggerService } from './swagger.service.js';

/** Export only utils provided outside sources */

export * from './logger.service.js';
export { HttpError } from './error.resource.js';
export { getEnv, RUNTIME, Runtime } from './runtime.js';

/** Returns a reference OpenAPI schema for a given resource */
export const resolveSchema = SwaggerService.resolveSchema;
