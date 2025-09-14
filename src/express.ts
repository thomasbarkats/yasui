import { LoggerService } from './services/logger.service.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      source?: string,
      logger?: LoggerService,
    }
  }
}

export {
  Application,
  Request,
  Response,
  NextFunction,
  RequestHandler,
} from 'express';
