import 'reflect-metadata';
import './@types/express';

import * as base from './base';
import * as services from './services';
import * as decorators from './decorators';

const scopes = {
    ...base,
    ...decorators,
    ...services,
};

const yasui = {
    ...scopes,
    default: scopes,
};

export = yasui;
