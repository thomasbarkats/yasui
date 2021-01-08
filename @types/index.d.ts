import express from 'express';
import { Server } from 'http';

export as namespace yasui;

export interface YasuiConfig {
    // eslint-disable-next-line @typescript-eslint/ban-types
    controllers?: Function[],
    middlewares?: express.RequestHandler[],
    environment?: string;
    port?: number;
    debug?: boolean,
    apiKey?: string,
}

export * from './decorators';
export * from './services';
export * from './enums';

export function createServer(conf: YasuiConfig): Server;
export function createApp(conf: YasuiConfig): express.Application;
export function connectMongoDB(url: string): void;
