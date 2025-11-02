import { TController } from './controller.i.js';
import { TMiddleware } from './middleware.i.js';
import { IPipeTransform } from './pipe.i.js';
import { ISwaggerConfig } from './swagger.i.js';
import { Constructible, Injection } from './utils.i.js';


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

/** TLS/SSL configuration for HTTPS */
export interface YasuiTLSConfig {
  /** Path to certificate file or inline certificate in PEM format */
  cert?: string;
  /** Path to private key file or inline private key in PEM format */
  key?: string;
  /** Optional passphrase for the private key */
  passphrase?: string;
  /** Optional CA certificates */
  ca?: string | string[];
}

/** Runtime-specific server options */
export interface YasuiRuntimeOptions {
  /** Node.js-specific options */
  node?: {
    /** Enable/disable HTTP/2 support (enabled by default in TLS mode)
     *  @default true */
    http2?: boolean;
    /** Maximum header size in bytes */
    maxHeaderSize?: number;
    /** Use IPv6 only (disable dual-stack) */
    ipv6Only?: boolean;
  };
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
  tls?: YasuiTLSConfig;
  /** Runtime-specific server options (Node.js, Deno, Bun) */
  runtimeOptions?: YasuiRuntimeOptions;
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
