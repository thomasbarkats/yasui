import 'reflect-metadata';
import './types/express';

import * as base from './base';
import * as services from './services';
import * as decorators from './decorators';
import * as enums from './types/enums';
import * as openapi from './types/openapi';
import * as utils from './utils';


const scope = {
    ...base,
    ...decorators,
    ...services,
    ...enums,
    ...openapi,
    ...utils,
};

const yasui = {
    ...scope,
    default: scope,
};

export = yasui;
