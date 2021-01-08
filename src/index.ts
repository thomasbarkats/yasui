import 'reflect-metadata';
import './types/express';

import * as base from './base';
import * as services from './services';
import * as decorators from './decorators';
import * as enums from './types/enums';

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
