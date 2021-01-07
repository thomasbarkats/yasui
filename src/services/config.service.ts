export abstract class ConfigService {

    public static get(name: string, backvalue = ''): string {
        return process.env[name] || backvalue;
    }
}
