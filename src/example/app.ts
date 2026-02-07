import { createServer } from 'yasui';
import { TestsController } from './tests.controller.js';
// import { cors } from '@yasui/cors';


createServer({
  controllers: [TestsController],
  // middlewares: [cors()],
  environment: 'development',
  port: 8081,
  debug: true,
  strictValidation: true,
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
