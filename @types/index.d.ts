import { Application } from 'express';
import { Server } from 'http';
import { YasuiConfig } from './interfaces';


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
};

export default yasui;
