import { Application } from 'express';
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
