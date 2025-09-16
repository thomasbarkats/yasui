import kleur from 'kleur';
import { NextFunction, Response } from 'express';
import { ErrorResource } from './error.resource.js';
import { Request } from '../express.js';
import { HttpCode } from '../enums/index.js';
import { LoggerService } from '../services/index.js';
import { YasuiConfig } from '../interfaces/index.js';


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
    this.logger.error(`Access denied (query attempt on ${kleur.italic(`${req.method} ${req.path}`)})`);
  }

  public logRequest(
    req: Request,
    res: Response,
    next: NextFunction
  ): void {
    const logger: LoggerService = req.logger || this.logger;
    logger.debug(`request ${kleur.italic(`${req.method} ${req.path}`)}`);
    next();
  }

  /** log and client response for 404 error */
  public handleNotFound(
    req: Request,
    res: Response,
  ): void {
    this.logger.error(`Cannot resolve ${req.method} ${req.path}`);
    res.sendStatus(HttpCode.NOT_FOUND);
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

    const isInternalServerError = errResource.status === HttpCode.INTERNAL_SERVER_ERROR;

    if (this.appConfig.debug || isInternalServerError) {
      const logger: LoggerService = req.logger || this.logger;
      logger.error(
        (isInternalServerError ? 'Unexpected ' : '') + err.constructor.name,
        req.source + (this.appConfig.debug ? '(debug)' : '')
      );
      console.error(kleur.red(
        `source: ${filename ? `${filename} ${line}:${column}` : 'undefined'}\n` +
        errResource.toString(),
      ));
    }
    next();
  }
}
