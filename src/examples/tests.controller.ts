import express from 'express';
import {
    Controller, Get, Post, Put,
    Res, Param, Header,
    HttpStatus
} from '..';
import { HelloMiddleware } from './hello.middleware';
import { TestsService } from './tests.service';


@Controller('/tests', HelloMiddleware)
export class TestsController {

    /** controllers allow service injections */
    private testsService: TestsService;

    constructor() {
        this.testsService = new TestsService();
    }


    @Get('/:name')
    private get(
        @Param('name') name: string,
        @Res() res: express.Response
    ): void {
        const message: string = this.testsService.getMessage(name);
        res.status(HttpStatus.OK).json({ message });
    }

    @Post('/')
    private post(
        @Header('name') name: string,
        @Res() res: express.Response
    ): void {
        res.status(HttpStatus.OK).json({ message: `${name} say hello!` });
    }

    @Put('/')
    private error(): void {
        throw new Error('I just simulate an error.');
    }
}
