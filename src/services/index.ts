import { ConfigService } from './config.service';
import { LoggerService } from './logger.service';

export const logger: LoggerService = new LoggerService();
export const config: ConfigService = new ConfigService();
