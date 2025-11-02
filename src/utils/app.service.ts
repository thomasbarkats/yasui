import kleur from 'kleur';
import { NextFunction, YasuiRequest } from '../web.js';
import { ErrorResource, HttpError } from './error.resource.js';
import { HttpCode } from '../enums/index.js';
import { LoggerService } from '../services/index.js';
import { MaybePromise, YasuiConfig } from '../interfaces/index.js';


export class AppService {
  private logger: LoggerService;
  private errorRegex: RegExp;

  constructor(private readonly appConfig: YasuiConfig) {
    this.logger = new LoggerService();

    // Compile regex once at initialization & cross-platform compatibility
    const cwd = process.cwd().replace(/\\/g, '[\\\\/]');
    this.errorRegex = new RegExp(
      `${cwd}[\\\\/](?!node_modules[\\\\/])([\\\\/\\w-_\\.]+\\.[mc]?[jt]s):(\\d+):(\\d+)`
    );
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
    this.logger.error(`Access denied (query attempt on ${kleur.italic(`${req.method} ${req.path}`)})`);
    return new Response(null, { status: HttpCode.FORBIDDEN });
  }

  public logRequest(
    req: YasuiRequest,
    next?: NextFunction
  ): MaybePromise<Response> {
    const logger: LoggerService = req.logger || this.logger;
    logger.debug(`request ${kleur.italic(`${req.method} ${req.path}`)}`);
    return next ? next() : new Response(null, { status: 200 });
  }

  /** log and client response for 404 error */
  public handleNotFound(
    req: YasuiRequest,
  ): Response {
    this.logger.error(`Cannot resolve ${req.method} ${req.path}`);
    return new Response(null, { status: HttpCode.NOT_FOUND });
  }

  /** pretty logs and client responses for errors */
  public handleErrors(
    err: HttpError | Error,
    req: YasuiRequest,
  ): Response {
    const stack: string = err.stack || '';
    const [, filename, line, column] = stack.match(this.errorRegex) || Array(0);

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
