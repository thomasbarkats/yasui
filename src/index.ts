/** Yasui - Lightweight Express-based framework for REST and web APIs */

import 'reflect-metadata';

import * as base from './base.js';
import * as services from './services/index.js';
import * as decorators from './decorators/index.js';
import * as enums from './enums/index.js';
import * as interfaces from './interfaces/index.js';
import * as express from './express.js';
import * as utils from './utils/index.js';

export * from './base.js';
export * from './services/index.js';
export * from './decorators/index.js';
export * from './enums/index.js';
export * from './interfaces/index.js';
export * from './express.js';
export * from './utils/index.js';


const yasui = {
  ...base,
  ...services,
  ...decorators,
  ...enums,
  ...interfaces,
  ...express,
  ...utils,
};
export default yasui;
