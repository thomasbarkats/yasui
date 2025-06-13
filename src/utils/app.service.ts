import { NextFunction, Request, Response } from 'express';
import { italic, red } from 'kleur';

import { HttpCode } from '~types/enums';
import { YasuiConfig } from '~types/interfaces';
import { ErrorResource } from './error.resource';
import { LoggerService } from '../services';


export class AppService {
  private logger: LoggerService;

  constructor(private readonly appConfig: YasuiConfig) {
    this.logger = new LoggerService();
  }


  /** restrict access to api with client key */
  public auth(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    if (req.headers['x-api-key'] === this.appConfig.apiKey) {
      return next();
    }
    res.sendStatus(HttpCode.FORBIDDEN);
    this.logger.error(`Access denied (query attempt on ${italic(`${req.method} ${req.path}`)})`);
  }

  public logRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const logger: LoggerService = req.logger || this.logger;
    logger.debug(`request ${italic(`${req.method} ${req.path}`)}`);
    next();
  }

  /** log and client response for 404 error */
  public handleNotFound(
    req: Request,
    res: Response,
  ): void {
    const message = `Cannot resolve ${req.method} ${req.path}`;
    res.sendStatus(HttpCode.NOT_FOUND);
    this.logger.error(message);
  }

  /** pretty logs and client responses for errors */
  public handleErrors(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const regEx = new RegExp(`${process.cwd()}\\/(?!node_modules\\/)([\\/\\w-_\\.]+\\.js):(\\d*):(\\d*)`);
    const stack: string = err.stack || '';
    const [, filename, line, column] = stack.match(regEx) || Array(0);

    const errResource = new ErrorResource(err, req);
    res.status(errResource.status).json(errResource);

    const logger: LoggerService = req.logger || this.logger;
    logger.error(`${err.constructor.name}`, req.source);
    if (this.appConfig.debug || errResource.status === HttpCode.INTERNAL_SERVER_ERROR) {
      console.error(red(
        `source: ${filename ? `${filename} ${line}:${column}` : 'undefined'}\n` +
        errResource.toString(),
      ));
    }
    next();
  }
}
