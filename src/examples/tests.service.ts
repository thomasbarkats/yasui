import { Injectable, LoggerService } from '..';


@Injectable()
export class TestsService {

    /** services allow deep injections */
    constructor(private readonly logger: LoggerService) {}


    public getMessage(name: string): string {
        return `Hello ${name}!`;
    }

    public helloWorld(source?: string): void {
        this.logger.log('Hello World!', source);
    }
}
