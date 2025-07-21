import {
  Application as ExprApplication,
  NextFunction as ExprNextFunction,
  Response as ExprResponse,
  Request as ExprRequest,
  RequestHandler as ExprRequestHandler,
} from 'express';
import { Server } from 'http';
import { YasuiConfig } from './interfaces';


import * as decorators from './decorators';
import * as services from './services';
import * as interfaces from './interfaces';
import * as enums from './enums';
import * as openapi from './openapi';
import * as utils from './utils';

export * from './decorators';
export * from './services';
export * from './interfaces';
export * from './enums';
export * from './openapi';
export * from './utils';

export type Application = ExprApplication;
export type Request = ExprRequest;
export type Response = ExprResponse;
export type NextFunction = ExprNextFunction;
export type RequestHandler = ExprRequestHandler;

export function createServer(conf: YasuiConfig): Server;
export function createApp(conf: YasuiConfig): Application;


declare const yasui: {
  createServer: (conf: YasuiConfig) => Server;
  createApp: (conf: YasuiConfig) => Application;
} &
  typeof decorators &
  typeof services &
  typeof interfaces &
  typeof enums &
  typeof openapi &
  typeof utils;

export default yasui;
