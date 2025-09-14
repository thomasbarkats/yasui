import kleur from 'kleur';
import { Server, createServer as createHttpServer } from 'http';
import { Application } from 'express';

import { YasuiConfig } from '~types/interfaces';
import { Core } from './core.js';


export function createServer(conf: YasuiConfig): Server {
  const core: Core = new Core(conf);

  console.clear();
  core.logger.log(kleur.bold('やすいです！'), 'yasui', kleur.magenta);

  if (conf.environment) {
    core.logger.log(`run as ${conf.environment} environment`, 'app', kleur.blue);
  }

  const app: Application = core.createApp();
  const server: Server = createHttpServer(app);
  const port: number | string = conf.port || 3000;

  server.listen(port, () => {
    if (core.decoratorValidator?.hasError()) {
      core.logger.warn('server started with errors');
      core.decoratorValidator.outputErrors();
      core.decoratorValidator = null;
    } else {
      core.logger.success('server successfully started');
    }

    const address = server.address();
    const protocol: string = conf.protocol || 'http';
    const host = address && typeof address === 'object' && address.address !== '::' ? address.address : 'localhost';
    const url = `${protocol}://${host}:${port}`;
    core.logger.log(`server listens on ${kleur.underline(url)}`);
    if (conf.swagger) {
      core.logger.log(`documentation on ${kleur.underline(`${url}/${conf.swagger.path || 'api-docs'}`)}`);
    }
  });
  return server;
}

export function createApp(conf: YasuiConfig): Application {
  const core: Core = new Core(conf);
  const app: Application = core.createApp();
  core.decoratorValidator?.outputErrors();
  core.decoratorValidator = null;
  return app;
}
