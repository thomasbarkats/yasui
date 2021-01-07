/* eslint-disable @typescript-eslint/no-explicit-any */

import 'reflect-metadata';

import * as base from './base';
import * as services from './services';
import * as decorators from './decorators';
import * as enums from './enums';


const scopes = {
    ...base,
    ...decorators,
    ...services,
    ...enums,
};

const yasui = {
    ...scopes,
    default: scopes,
};

export = yasui;
