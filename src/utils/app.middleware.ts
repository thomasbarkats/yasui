import express from 'express';
import { italic, gray } from 'kleur';

import { HttpStatus } from '../types/enums';
import { logger, timeLogger } from '../services';
import { ErrorResource } from './error.resource';


export class AppMiddleware {
    private apiKey: string | undefined;

    constructor(apiKey?: string) {
        this.apiKey = apiKey;
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
        logger.error(`Access denied (query attempt on ${req.method} ${req.path})`);
        res.sendStatus(HttpStatus.FORBIDDEN);
    }

    public static logRequest(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        logger.debug(`request ${italic(`${req.method} ${req.path}`)}`);
        next();
    }

    /** log and client response for 404 error */
    public static handleNotFound(
        req: express.Request,
        res: express.Response,
    ): void {
        const message = `Cannot resolve ${req.method} ${req.path}`;
        logger.error(message);
        res.sendStatus(HttpStatus.NOT_FOUND);
    }

    /** pretty logs and client responses for errors */
    public static handleErrors(
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

        const reqLogger: timeLogger = req.logger || new timeLogger();
        const time: number = reqLogger.stop();
        logger.error(
            `${err.constructor.name}  ${gray(`+${time}ms`)}\n` +
            `source: ${filename ? `${filename} ${line}:${column}` : 'undefined'}\n` +
            errResource.toString(),
            req.source
        );
        next();
    }
}
