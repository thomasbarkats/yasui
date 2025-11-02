import { getEnv } from '../utils/runtime.js';

/** Configuration utility service */
export abstract class ConfigService {

  /**
   * Safe method to read an environment variable
   * @param name environment variable name
   * @param back optional default / fallback value
   */
  public static get(name: string, back = ''): string {
    return getEnv(name, back);
  }
}
