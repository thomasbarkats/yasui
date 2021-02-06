/* eslint-disable @typescript-eslint/ban-types */

import express from 'express';
import { Server } from 'http';
import { BaseConfig } from './interfaces';

export as namespace yasui;

export * from './decorators';
export * from './services';
export * from './enums';

export function createServer(conf: BaseConfig): Server;
export function createApp(conf: BaseConfig): express.Application;
export function connectMongoDB(url: string): void;
