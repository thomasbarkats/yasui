import { Server, createServer as createHttpServer } from 'http';
import { Application } from 'express';
import { blue, bold, magenta } from 'kleur';

import { CoreConfig } from './types/interfaces';
import { Core } from './core';


export function createServer(conf: CoreConfig): Server {
    const core: Core = new Core(conf);

    console.clear();
    core.logger.log(bold('（◠‿◠）やすいです！'), 'yasui', magenta);

    if (conf.environment) {
        core.logger.log(`run as ${conf.environment} environment`, 'app', blue);
    }

    const app: Application = core.createApp();
    const server: Server = createHttpServer(app);
    const port: number | string = conf.port || 3000;

    server.listen(port, () => {
        core.logger.success('server successfully started');
        core.logger.log(`server listens on port ${port}`);
    });
    return server;
}

export function createApp(conf: CoreConfig): Application {
    const core: Core = new Core(conf);
    return core.createApp();
}
