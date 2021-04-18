/* eslint-disable @typescript-eslint/ban-types */

import express from 'express';
import { Server } from 'http';
import { BaseConfig } from './interfaces';


export function createServer(conf: BaseConfig): Server;
export function createApp(conf: BaseConfig): express.Application;
