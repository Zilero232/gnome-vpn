import type { LoggerService } from '@nestjs/common';

import { createLogger } from '@gnomevpn/logger';

import { APP_LOGGER } from './logger.constants';

const root = createLogger(APP_LOGGER);

const contextOf = (context: string | undefined) => (context ? { context } : {});

export class AppLogger implements LoggerService {
  log(message: unknown, context?: string) {
    root.info(contextOf(context), String(message));
  }

  error(message: unknown, stack?: string, context?: string) {
    root.error({ ...contextOf(context), ...(stack ? { stack } : {}) }, String(message));
  }

  warn(message: unknown, context?: string) {
    root.warn(contextOf(context), String(message));
  }

  debug(message: unknown, context?: string) {
    root.debug(contextOf(context), String(message));
  }

  verbose(message: unknown, context?: string) {
    root.trace(contextOf(context), String(message));
  }
}

export const appLogger = new AppLogger();
