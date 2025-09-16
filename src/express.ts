import { Request as ExpressRequest } from 'express';
import { LoggerService } from './services/logger.service.js';


export interface Request extends ExpressRequest {
  source?: string,
  logger?: LoggerService,
}

export {
  Application,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
