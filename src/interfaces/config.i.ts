import { TController } from './controller.i.js';
import { TMiddleware } from './middleware.i.js';
import { IPipeTransform } from './pipe.i.js';
import { ISwaggerConfig } from './swagger.i.js';
import { Constructible, Injection } from './utils.i.js';
import type { ServerOptions } from 'srvx';


/** YasuiJS Swagger configuration */
export interface YasuiSwaggerConfig extends Omit<ISwaggerConfig, 'openapi' | 'paths' | 'components'> {
  /** Whether to generate swagger documentation
   *  @default false */
  generate: boolean;
  /** Output path for generated swagger documentation
   *  @default /api-docs */
  path?: string;
  /** CDN base URL for Swagger UI assets (CSS, JS, icons)
   *  @default https://cdn.jsdelivr.net/npm/swagger-ui-dist@5
   *  @example https://unpkg.com/swagger-ui-dist@5
   *  @example /swagger-ui (for local self-hosted assets) */
  cdn?: string;
}


/** YasuiJS configuration */
export interface YasuiConfig {
  controllers?: TController[];
  middlewares?: TMiddleware[];
  /** Global pipes applied to all route parameters in sequence */
  globalPipes?: Constructible<IPipeTransform>[];
  /** Pre-registered customs injections */
  injections?: Injection[];
  environment?: string;
  /** The hostname (IP or resolvable host) server listener should bound to.
  *   If not provided, server with listen to all network interfaces by default ! */
  hostname?: string;
  /** Listening port of your server
   *  @default 3000 */
  port?: number | string;
  /** @deprecated Protocol is now automatically determined from TLS configuration. */
  protocol?: 'http' | 'https';
  /** TLS/SSL configuration for HTTPS. When provided, server will use HTTPS protocol */
  tls?: ServerOptions['tls'];
  /** Runtime-specific server options (Node.js, Deno, Bun) */
  runtimeOptions?: Pick<ServerOptions, 'node' | 'bun' | 'deno' | 'serviceWorker'>;
  /** If true, display more logs and logs all incoming requests
   *  @default false */
  debug?: boolean;
  /** Optional required API key for all requests */
  apiKey?: string;
  /** If false, disables all validation checks on decorators (unsafe)
   *  @default true */
  enableDecoratorValidation?: boolean;
  /** If true, throws error on type casting failures and JSON parsing errors,
   *  instead of setting invalid values (NaN, Invalid Date) or undefined body
   *  @default false */
  strictValidation?: boolean;
  /** Maximum request body size in bytes. Requests exceeding this limit will be rejected with 413 Payload Too Large
   *  @default 10485760 (10MB) */
  maxBodySize?: number;
  /** Maximum total header size in bytes. Requests exceeding this limit will be rejected with 413 Payload Too Large
   *  @default 16384 (16KB) */
  maxHeaderSize?: number;
  /** Request timeout in milliseconds. Requests exceeding this duration will be terminated with 408 Request Timeout
   *  @default 30000 (30s) */
  requestTimeout?: number;
  swagger?: YasuiSwaggerConfig;
}
