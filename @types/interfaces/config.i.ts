import { TController } from './controller.i.js';
import { TMiddleware } from './middleware.i.js';
import { IPipeTransform } from './pipe.i.js';
import { ISwaggerConfig } from './swagger.i.js';
import { Constructible, Injection } from './utils.i.js';


export interface YasuiSwaggerConfig extends Omit<ISwaggerConfig, 'openapi' | 'paths' | 'components'> {
  /** Whether to generate swagger documentation
   *  @default false */
  generate: boolean;
  /** Output path for generated swagger documentation
   *  @default /api-docs */
  path?: string;
}

export interface YasuiConfig {
  controllers?: TController[];
  middlewares?: TMiddleware[];
  /** Global pipes applied to all route parameters in sequence */
  globalPipes?: Constructible<IPipeTransform>[];
  /** Pre-registered customs injections */
  injections?: Injection[];
  environment?: string;
  /** Listening port of your server
   *  @default 3000 */
  port?: number | string;
  /** Used for logs only for now
   *  @default false */
  protocol?: 'http' | 'https';
  /** If true, display more logs and logs all incoming requests
   *  @default false */
  debug?: boolean;
  /** Optional required API key for all requests */
  apiKey?: string;
  /** If false, disables all validation checks on decorators (unsafe)
   *  @default true */
  enableDecoratorValidation?: boolean;
  swagger?: YasuiSwaggerConfig;
}
