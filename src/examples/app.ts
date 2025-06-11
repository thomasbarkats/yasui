import yasui from '..';
import { TestsController } from './tests.controller';


yasui.createServer({
  controllers: [TestsController],
  middlewares: [],
  environment: 'development',
  port: 8080,
  debug: true,
  swagger: {
    generate: true,
    path: 'api-docs',
    info: {
      title: 'TEST API',
      version: '1.0.0',
      description: 'Example of a simple API using Yasui',
    }
  }
});
