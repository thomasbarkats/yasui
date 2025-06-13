import { LoggerService } from './services';

export { };

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      source?: string,
      logger?: LoggerService,
    }
  }
}
