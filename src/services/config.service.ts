export class ConfigService {

    public get(name: string, back = ''): string {
        return process.env[name] || back;
    }
}
