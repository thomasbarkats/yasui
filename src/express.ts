import { Request as ExpressRequest } from 'express';
import { LoggerService } from './services/logger.service.js';


/** Overload of the Express Request interface in Yasui's context */
export interface Request extends ExpressRequest {
  source?: string,
  logger?: LoggerService,
}

/** Re-export of Express objects used in Yasui's context */
export {
  Application,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
