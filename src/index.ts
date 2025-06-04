import 'reflect-metadata';
import './types/express';

import * as base from './base';
import * as services from './services';
import * as decorators from './decorators';
import * as enums from './types/enums';
import * as openapi from './types/openapi';
import * as utils from './utils';

export * from './base';
export * from './services';
export * from './decorators';
export * from './types/enums';
export * from './types/openapi';
export * from './utils';


const yasui = {
    ...base,
    ...decorators,
    ...services,
    ...enums,
    ...openapi,
    ...utils,
};

export default yasui;

// for CommonJS
module.exports = Object.assign(yasui, { default: yasui });
