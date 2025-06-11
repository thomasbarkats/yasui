import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  Body,
  Controller,
  ErrorResourceSchema,
  Get,
  Header,
  HttpStatus,
  Param,
  Post,
  Put,
} from '..';

import { HttpCode } from '~types/enums';
import { TestsService } from './tests.service';
import { HelloMiddleware } from './hello.middleware';


@Controller('/tests', HelloMiddleware)
export class TestsController {

  constructor(
        private readonly testsService: TestsService,
  ) { }


    @Get('/:name')
    @ApiOperation('Get personalized message', 'Returns a greeting message for the given name')
    @ApiParam('name', 'The name for the greeting', true, { type: 'string', example: 'John' })
    @ApiResponse(200, 'Success', { type: 'string', example: 'Hello John!' })
  private get(
        @Param('name') name: string,
  ): string {
    return this.testsService.getMessage(name);
  }

    /**
     * routes not annotated for Swagger documentation (if enabled)
     * will still have minimal documentation by default
     */
    @Post('/')
    @HttpStatus(HttpCode.CREATED)
    private post(
        @Header('name') name: string,
        @Body() data: { message: string; },
    ): string {
      return `${name} say ${data?.message}!`;
    }

    @Put('/')
    @ApiOperation('Simulate error 500', 'Deliberately throws an error for testing purposes')
    @ApiResponse(500, 'Internal server error', ErrorResourceSchema())
    private error(): void {
      /**
         * custom error must inherit from Error and have a status property
         * 500 (Internal server error) is returned by default
         */
      throw new Error('I just simulate an error.');
    }
}
