import { ILogger } from "../types";

export class ConsoleLogger implements ILogger {
  log(message: string, ...args: any[]): void {
    console.log(message, ...args);
  }
  info(message: string, ...args: any[]): void {
    console.info(message, ...args);
  }
  warn(message: string, ...args: any[]): void {
    console.warn(message, ...args);
  }
  error(message: string, ...args: any[]): void {
    console.error(message, ...args);
  }
  debug(message: string, ...args: any[]): void {
    console.debug(message, ...args);
  }
}
