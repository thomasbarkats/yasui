import kleur from 'kleur';
import { serve, type Server } from 'srvx';
import { Core } from './core.js';
import { YasuiConfig } from './interfaces/index.js';
import { FetchHandler } from './web.js';


/** Create a server with Yasui's configuration and defined routes, and start listening */
export function createServer(conf: YasuiConfig): Server {
  const core: Core = new Core(conf);

  console.clear();
  core.logger.log(kleur.bold('やすいです！'), 'yasui', kleur.magenta);

  if (conf.environment) {
    core.logger.log(`run as ${conf.environment} environment`, 'app', kleur.blue);
  }

  const app: FetchHandler = core.createApp();

  // Determine protocol: support deprecated 'protocol' field for backward compatibility
  const hasTLS = conf.tls && (conf.tls.cert || conf.tls.key);
  const protocol: 'http' | 'https' = hasTLS ? 'https' : 'http';

  const port: number | string = conf.port || 3000;
  const hostname: string | undefined = conf.hostname ||
    (conf.environment === 'development' ? 'localhost' : undefined);

  // Build srvx server options
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serverOptions: any = {
    fetch: app.fetch,
    silent: true,
    protocol,
    port,
    hostname,
  };

  // Add TLS configuration if provided
  if (conf.tls) {
    serverOptions.tls = {
      ...(conf.tls.cert && { cert: conf.tls.cert }),
      ...(conf.tls.key && { key: conf.tls.key }),
      ...(conf.tls.passphrase && { passphrase: conf.tls.passphrase }),
      ...(conf.tls.ca && { ca: conf.tls.ca }),
    };
  }

  // Add runtime-specific options
  if (conf.runtimeOptions?.node) {
    serverOptions.node = {
      ...(conf.runtimeOptions.node.http2 !== undefined && { http2: conf.runtimeOptions.node.http2 }),
      ...(conf.runtimeOptions.node.maxHeaderSize && { maxHeaderSize: conf.runtimeOptions.node.maxHeaderSize }),
      ...(conf.runtimeOptions.node.ipv6Only !== undefined && { ipv6Only: conf.runtimeOptions.node.ipv6Only }),
    };
  }

  const server = serve(serverOptions);

  if (core.decoratorValidator?.hasError()) {
    core.logger.warn('server started with errors');
    core.decoratorValidator.outputErrors();
    core.decoratorValidator = null;
  } else {
    core.logger.success('server successfully started');
  }

  // Display server URL and configuration
  const url = `${protocol}://${hostname || 'localhost'}:${port}`;
  core.logger.log(`server listens on ${kleur.underline(url)}`);

  // Show TLS/HTTP2 status
  if (protocol === 'https') {
    const http2Status = conf.runtimeOptions?.node?.http2 === false ? 'disabled' : 'enabled';
    core.logger.log(`TLS enabled, HTTP/2 ${http2Status} (Node.js)`);
  }

  if (conf.swagger) {
    core.logger.log(`documentation on ${kleur.underline(`${url}/${conf.swagger.path || 'api-docs'}`)}`);
  }

  return server;
}

/** Create only a fetch handler with Yasui's configuration and defined routes (without starting server) */
export function createApp(conf: YasuiConfig): FetchHandler {
  const core: Core = new Core(conf);
  const app: FetchHandler = core.createApp();
  core.decoratorValidator?.outputErrors();
  core.decoratorValidator = null;
  return app;
}
