import yasui from '..';
import { TestsController } from './tests.controller';


yasui.createServer({
    controllers: [TestsController],
    middlewares: [],
    environment: 'development',
    port: 8080,
    debug: true,
});
