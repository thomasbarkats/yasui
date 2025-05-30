import { Controller, Get, Post, Put, HttpCode, Param, Header, HttpStatus } from '..';
import { HelloMiddleware } from './hello.middleware';
import { TestsService } from './tests.service';


@Controller('/tests', HelloMiddleware)
export class TestsController {

    /** controllers allow service injections */
    constructor(
        private readonly testsService: TestsService,
    ) { }

    @Get('/:name')
    private get(
        @Param('name') name: string,
    ): string {
        return this.testsService.getMessage(name);
    }

    @Post('/')
    @HttpStatus(HttpCode.CREATED)
    private post(
        @Header('name') name: string,
    ): string {
        return `${name} say hello!`;
    }

    @Put('/')
    private error(): void {
        /**
         * custom error must inherit from Error and have a status property
         * 500 (Internal server error) is returned by default
         */
        throw new Error('I just simulate an error.');
    }
}
