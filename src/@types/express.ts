/* eslint-disable @typescript-eslint/no-namespace */

import { timeLogger } from '../services';

export { };

declare global {
    namespace Express {
        interface Request {
            source?: string,
            logger?: timeLogger,
        }
    }
}
