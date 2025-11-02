import { YasuiConfig } from '../interfaces/index.js';


/** Catches configuration errors early with helpful messages */
export class ConfigValidator {
  static validate(config: YasuiConfig): void {
    if (config.port) {
      const port = typeof config.port === 'string'
        ? parseInt(config.port)
        : config.port;

      if (isNaN(port) || port < 0 || port > 65535) {
        throw new Error(`Invalid port: ${config.port}. Must be 0-65535.`);
      }
    }

    if (config.tls) {
      if (!config.tls.cert && !config.tls.key) {
        throw new Error('TLS config requires at least cert or key');
      }
    }

    if (config.hostname && typeof config.hostname !== 'string') {
      throw new Error(`Invalid hostname: ${config.hostname}`);
    }
  }
}
