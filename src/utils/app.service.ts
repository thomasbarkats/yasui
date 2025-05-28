import express from 'express';
import { italic, red } from 'kleur';

import { HttpCode } from '../types/enums';
import { ErrorResource } from './error.resource';
import { LoggerService } from '../services/logger.service';


export class AppService {
    private logger: LoggerService;

    constructor(private readonly apiKey?: string) {
        this.logger = new LoggerService();
    }


    /** restrict access to api with client key */ 
    public auth(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        if (req.headers['x-api-key'] === this.apiKey) {
            return next();
        }
        res.sendStatus(HttpCode.FORBIDDEN);
        this.logger.error(`Access denied (query attempt on ${italic(`${req.method} ${req.path}`)})`);
    }

    public logRequest(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        const logger: LoggerService = req.logger || this.logger;
        logger.debug(`request ${italic(`${req.method} ${req.path}`)}`);
        next();
    }

    /** log and client response for 404 error */
    public handleNotFound(
        req: express.Request,
        res: express.Response,
    ): void {
        const message = `Cannot resolve ${req.method} ${req.path}`;
        res.sendStatus(HttpCode.NOT_FOUND);
        this.logger.error(message);
    }

    /** pretty logs and client responses for errors */
    public handleErrors(
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        const regEx = new RegExp(`${process.cwd()}\\/(?!node_modules\\/)([\\/\\w-_\\.]+\\.js):(\\d*):(\\d*)`);
        const stack: string = err.stack || '';
        const [, filename, line, column ] = stack.match(regEx) || Array(0);

        const errResource = new ErrorResource(err, req);
        res.status(errResource.status).json(errResource);

        const logger: LoggerService = req.logger || this.logger;
        logger.error(`${err.constructor.name}`, req.source);
        console.error(red(
            `source: ${filename ? `${filename} ${line}:${column}` : 'undefined'}\n` +
            errResource.toString(),
        ));
        next();
    }
}
