import express from 'express';
import { LoggerService } from './services';


export interface Request extends express.Request {
  source?: string,
  logger?: LoggerService,
}

export type Application = express.Application;
export type Response = express.Response;
export type NextFunction = express.NextFunction;
export type RequestHandler = express.RequestHandler;
