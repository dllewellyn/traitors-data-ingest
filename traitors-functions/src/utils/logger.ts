/* eslint-disable @typescript-eslint/no-explicit-any */
import * as functions from "firebase-functions";

export const logger = {
  info: (message: string | object, ...args: any[]) => {
    functions.logger.info(message, ...args);
  },
  warn: (message: string | object, ...args: any[]) => {
    functions.logger.warn(message, ...args);
  },
  error: (message: string | object, ...args: any[]) => {
    functions.logger.error(message, ...args);
  },
  debug: (message: string | object, ...args: any[]) => {
    functions.logger.debug(message, ...args);
  },
  log: (message: string | object, ...args: any[]) => {
    functions.logger.log(message, ...args);
  },
};
