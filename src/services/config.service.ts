export abstract class ConfigService {

  public static get(name: string, back = ''): string {
    return process.env[name] || back;
  }
}
