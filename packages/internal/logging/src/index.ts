import type { Logger } from '@template/app-defs';
import Env from '@template/env';
import pino from 'pino';
import { nestStyleTransport } from './pino';

export const PrettyStream:
  | pino.DestinationStream
  | undefined =
  Env.NODE_ENV === 'production'
    ? nestStyleTransport // TODO change
    : nestStyleTransport;

const base = pino(
  {
    level: 'debug',
    timestamp: pino.stdTimeFunctions.epochTime,
  },
  PrettyStream
);

function wrapPino(p: pino.Logger): Logger {
  return {
    log: (msg, meta) => p.info({ ...meta }, msg),
    info: (msg, meta) => p.info({ ...meta }, msg),
    warn: (msg, meta) => p.warn({ ...meta }, msg),
    error: (msg, meta) => {
      if (meta instanceof Error) {
        p.error({ err: meta, stack: meta.stack }, msg);
      } else if (typeof meta === 'string') {
        const error = new Error(meta);
        p.error(
          { err: error, stack: error.stack, context: meta },
          msg
        );
      } else if (
        meta &&
        typeof meta === 'object' &&
        meta.stack
      ) {
        p.error(
          { err: meta, stack: meta.stack, ...meta },
          msg
        );
      } else {
        const error = new Error(msg);
        p.error({ ...meta, stack: error.stack }, msg);
      }
    },
    debug: (msg, meta) => p.debug({ ...meta }, msg),
    child: (ctx) => wrapPino(p.child(ctx)),
  };
}

export const logger = wrapPino(base);

export const makeLogger = (name: string): Logger => {
  return wrapPino(base.child({ name }));
};
