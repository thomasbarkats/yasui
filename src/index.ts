import 'reflect-metadata';
import './types/express';

import * as base from './base';
import * as injector from './injector';
import * as services from './services';
import * as decorators from './decorators';
import * as enums from './types/enums';


const scope = {
    ...base,
    ...injector,
    ...decorators,
    ...services,
    ...enums,
};

const yasui = {
    ...scope,
    default: scope,
};

export = yasui;
