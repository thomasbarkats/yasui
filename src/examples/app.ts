import yasui from '..';
import { TestsController } from './tests.controller';

/**
 * no need to specify param if empty or false,
 * here all filled for the example
 */
yasui.createServer({
    controllers: [TestsController],
    middlewares: [], 
    environment: 'developement',
    port: 8080, // 3000 by default
    debug: true, // false by default
});

yasui.connectMongoDB('mongodb://localhost:27017/test');
