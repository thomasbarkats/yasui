import kleur from 'kleur';
import { NextFunction, YasuiRequest } from '../web.js';
import { ErrorResource, HttpError } from './error.resource.js';
import { HttpCode } from '../enums/index.js';
import { LoggerService } from '../services/index.js';
import { MaybePromise, YasuiConfig } from '../interfaces/index.js';


export class AppService {
  private logger: LoggerService;

  constructor(private readonly appConfig: YasuiConfig) {
    this.logger = new LoggerService();
  }


  /** restrict access to api with client key */
  public auth(
    req: YasuiRequest,
    next?: NextFunction
  ): MaybePromise<Response> {
    const apiKey = req.headers['x-api-key'];
    if (apiKey === this.appConfig.apiKey && next) {
      return next();
    }
    const url = new URL(req.url);
    this.logger.error(`Access denied (query attempt on ${kleur.italic(`${req.method} ${url.pathname}`)})`);
    return new Response(null, { status: HttpCode.FORBIDDEN });
  }

  public logRequest(
    req: YasuiRequest,
    next?: NextFunction
  ): MaybePromise<Response> {
    const logger: LoggerService = req.logger || this.logger;
    const url = new URL(req.url);
    logger.debug(`request ${kleur.italic(`${req.method} ${url.pathname}`)}`);
    return next ? next() : new Response(null, { status: 200 });
  }

  /** log and client response for 404 error */
  public handleNotFound(
    req: YasuiRequest,
  ): Response {
    const url = new URL(req.url);
    this.logger.error(`Cannot resolve ${req.method} ${url.pathname}`);
    return new Response(null, { status: HttpCode.NOT_FOUND });
  }

  /** pretty logs and client responses for errors */
  public handleErrors(
    err: HttpError | Error,
    req: YasuiRequest,
  ): Response {
    const regEx = new RegExp(`${process.cwd()}\\/(?!node_modules\\/)([\\/\\w-_\\.]+\\.js):(\\d*):(\\d*)`);
    const stack: string = err.stack || '';
    const [, filename, line, column] = stack.match(regEx) || Array(0);

    const errResource = new ErrorResource(err, req);

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

    return Response.json(errResource, { status: errResource.status });
  }
}
