import { logger } from '..';

export class TestsService {

    public getMessage(name: string): string {
        return `Hello ${name}!`;
    }

    public helloWorld(source?: string): void {
        logger.log('Hello World!', source);
    }
}
