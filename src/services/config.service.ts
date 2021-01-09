export class ConfigService {

    public get(name: string, backvalue = ''): string {
        return process.env[name] || backvalue;
    }
}
