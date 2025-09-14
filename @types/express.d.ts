import express from 'express';
import { LoggerService } from './services';


declare global {
  namespace Express {
    interface Request {
      source?: string,
      logger?: LoggerService,
    }
  }
}

export type Application = express.Application;
export type Request = express.Request;
export type Response = express.Response;
export type NextFunction = express.NextFunction;
export type RequestHandler = express.RequestHandler;
