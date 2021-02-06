import { logger } from '..';

export class TestsService {

    public getMessage(name: string): string {
        return `Hello ${name}!`;
    }

    public logHello(): void {
        logger.success('Hello');
    }
}
