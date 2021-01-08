import yasui from '..';
import { TestsController, TestsMiddleware } from './tests.controller';

/**
 * no need to specify param if empty or false
 */
yasui.createServer({
    controllers: [TestsController],
    middlewares: [TestsMiddleware.hello], 
    environment: 'developement',
    port: 8080, // 3000 by default
    debug: true, // false by default
});

yasui.connectMongoDB('mongodb://localhost:27017/test');
