import type { ContextUserSchema, SessionSchema } from '@template/app-defs';
import Env from '@template/env';
import { THIRTY_DAYS_TTL } from './constants';

export function makeSessionKey(userId: string) {
  return `session:${userId}`;
}

export function makeSessionObject(
  user: ContextUserSchema,
  sessionVersion: number
): SessionSchema {
  return {
    user,
    version: sessionVersion,
  };
}

export function getSessionTtl() {
  return Env.NODE_ENV === 'development'
    ? THIRTY_DAYS_TTL
    : Env.SESSION_TTL_SECONDS;
}
