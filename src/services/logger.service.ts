import kleur from 'kleur';

import { Injectable } from '../decorators';


@Injectable()
export class LoggerService {
  public startTime: number | undefined;
  public lastTime: number | undefined;
  public endTime: number | undefined;
    
  public start(): this {
    this.startTime = new Date().getTime();
    this.lastTime = this.startTime;
    return this;
  }

  public reset(): this {
    this.startTime = undefined;
    this.lastTime = undefined;
    this.endTime = undefined;
    return this;
  }

  public stop(): number {
    if (this.startTime) {
      this.endTime = new Date().getTime();
      return this.endTime - this.startTime;
    }
    throw new Error('No timers started');
  }

  public getTime(): number {
    if (this.lastTime) {
      const currentTime: number = new Date().getTime();
      const timeDiff: number = currentTime - this.lastTime;
      this.lastTime = currentTime;
      return timeDiff;
    }
    throw new Error('No timers started');
  }

  public log(message: string, src?: string, color?: kleur.Color): void {
    const text = this.getText(message, src);
    console.log(color ? color(text) : text);
  }

  public debug(message: string, src?: string): void {
    src = src ? `${src}(debug)` : 'app(debug)';
    console.log(this.getText(message, kleur.cyan(src)));
  }

  public success(message: string, src?: string): void {
    console.log(kleur.green(this.getText(message, src)));
  }

  public error(message: string, src?: string): void {
    console.error(kleur.red(this.getText(message, src)));
  }

  public warn(message: string, src?: string): void {
    console.warn(kleur.yellow(this.getText(message, src)));
  }

  private getDate(): string {
    const date: Date = new Date();
    return kleur.gray(`[${date.toISOString()}]`);
  }

  private getText(message: string, src?: string): string {
    const text = `${this.getDate()} ${kleur.bold(src ? src : 'app')}: ${message}`;
    if (this.lastTime) {
      return text + kleur.gray(`  +${this.getTime()}ms`);
    }
    return text;
  }
}
