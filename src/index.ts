import 'reflect-metadata';
import './types/express';

import * as base from './base';
import * as services from './services';
import * as decorators from './decorators';
import * as enums from './types/enums';


const scope = {
    ...base,
    ...decorators,
    ...services,
    ...enums,
};

const yasui = {
    ...scope,
    default: scope,
};

export = yasui;
