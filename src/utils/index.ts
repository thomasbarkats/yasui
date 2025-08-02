import { SwaggerService } from './swagger.service';

/**
 * Export only utils provided outside sources
 */

export { HttpError, ErrorResourceSchema } from './error.resource';
export const resolveSchema = SwaggerService.resolveSchema;
