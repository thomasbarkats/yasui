import express from 'express';
import { get } from 'lodash';
import chalk from 'chalk';

import { logger } from '../services';
import { ErrorResource } from './error.resource';


export class AppMiddleware {
    private apiKey: string | undefined;

    constructor(apiKey?: string) {
        this.apiKey = apiKey;
    }

    // restrict access to api with client key
    public auth(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        if (get(req, ['headers', 'x-api-key']) === this.apiKey) {
            return next();
        }
        logger.error(`Access denied (query attempt on ${req.method} ${req.path})`);
        res.sendStatus(403);
    }

    public static logRequest(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        logger.debug(`request ${chalk.italic(`${req.method} ${req.path}`)}`);
        next();
    }

    // log and client response for 404 error
    public static handleNotFound(
        req: express.Request,
        res: express.Response,
    ): void {
        const message = `Cannot resolve ${req.method} ${req.path}`;
        logger.error(message);
        res.sendStatus(404);
    }

    // pretty logs and client responses for errors
    public static handleErrors(
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ): void {
        const regEx = new RegExp(`${process.cwd()}\\/(?!node_modules\\/)([\\/\\w-_\\.]+\\.js):(\\d*):(\\d*)`);
        const [, filename, line, column ] = get(err, 'stack', '').match(regEx) || Array(0);

        const errResource = new ErrorResource(err, req);
        res.status(errResource.status).json(errResource);

        const time: number = get(req, 'logger').stop();
        logger.error(
            `${err.constructor.name} ${chalk.gray(`+${time}ms`)}\n` +
            `source: ${filename ? `${filename} ${line}:${column}` : 'undefined'}\n` +
            errResource.toString(),
            get(req, 'source')
        );
        next();
    }
}
