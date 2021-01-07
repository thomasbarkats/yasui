/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-explicit-any */

import express from 'express';
import { Server } from 'http';

export as namespace yasui;

import { YasuiConfig } from './base.config';
export { YasuiConfig };

export * from './decorators';
export * from './services';
export * from './enums';

export function createServer(conf: YasuiConfig): Server;
export function createApp(conf: YasuiConfig): express.Application;
export function connectMongoDB(url: string): void;
