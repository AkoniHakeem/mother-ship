import { join } from 'path';
import pino from 'pino';
import { cwd } from 'process';

export const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      destination: join(cwd(), 'logs/uwebsockets.log'),
      colorize: false,
      mkdir: true,
      crlf: true,
    },
  },
});

export const Logger = logger;

export const getLoggerFor = (destination = 'logs/uwebsockets.log') => {
  return pino({
    transport: {
      target: 'pino-pretty',
      options: {
        destination: join(cwd(), destination),
        colorize: false,
        mkdir: true,
        crlf: true,
      },
    },
  }) as unknown as Record<'info' | 'warn' | 'error', (...args: unknown[]) => unknown>;
};
