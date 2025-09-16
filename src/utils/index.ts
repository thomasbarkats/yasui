import { SwaggerService } from './swagger.service.js';

/** Export only utils provided outside sources */


export { HttpError } from './error.resource.js';

/** Returns a reference OpenAPI schema for a given resource */
export const resolveSchema = SwaggerService.resolveSchema;
