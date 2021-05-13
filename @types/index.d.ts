import { Application } from 'express';
import { Server } from 'http';
import { YasuiConfig } from './interfaces';


export as namespace yasui;

export * from './decorators';
export * from './services';
export * from './interfaces';
export * from './enums';

export function createServer(conf: YasuiConfig): Server;
export function createApp(conf: YasuiConfig): Application;
