import yasui from '..';
import { TestsController } from './tests.controller';

/** no need to specify a param if it empty or false */
yasui.createServer({
    controllers: [TestsController],
    middlewares: [], 
    environment: 'developement',
    port: 8080, // 3000 by default
    debug: true, // false by default
    apiKey: 'TEST',
});

yasui.connectMongoDB('mongodb://localhost:27017/test');
