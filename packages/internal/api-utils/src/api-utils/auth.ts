import {
  type AppContext,
  type ContextUserSchema,
  type HonoRequest,
  SessionSchema,
} from '@template/app-defs';
import cache from '@template/cache';
import Env from '@template/env';
import { makeError } from '@template/error';
import jwt from 'jsonwebtoken';
import { makeSessionKey } from './session';

export async function getAppActor(
  req: HonoRequest
): Promise<{
  context: AppContext;
  user: ContextUserSchema;
}> {
  try {
    const bearerToken = getBearerToken(req);

    if (!bearerToken) {
      throw Error;
    }

    const payload = verifyJwt<string>(bearerToken);
    const userSession =
      await SessionSchema.parseAsync(payload);

    const sessionKey = makeSessionKey(userSession.user.id);

    const session =
      await cache.get<SessionSchema>(sessionKey);

    if (!session) {
      throw Error;
    }

    if (session.version !== userSession.version) {
      throw Error;
    }

    return {
      context: {
        userId: session.user.id,
        developerId: session.user.developerProfile?.id,
      },
      user: session.user,
    };
  } catch {
    throw makeError({
      type: 'UNAUTHORIZED',
      message: 'Unauthorized',
    });
  }
}

const BearerRXP = /[Bb]earer/g;

export function getBearerToken(
  req: HonoRequest
): string | undefined {
  return decodeURIComponent(
    req.raw.headers.get('authorization') || ''
  )
    ?.replace(BearerRXP, '')
    .trim();
}

export function getJwtExpiresIn() {
  const expiresMap = {
    production: '3Days',
    development: '30Days',
    testing: '1Hours',
    staging: '3Days',
  } as const;

  return expiresMap[Env.NODE_ENV] ?? '3Days';
}

export function signJwt(payload: object): string {
  return jwt.sign(payload, Env.ACCESS_TOKEN_SECRET, {
    expiresIn: getJwtExpiresIn(),
  });
}

export function verifyJwt<T>(token: string): T {
  return jwt.verify(token, Env.ACCESS_TOKEN_SECRET) as T;
}
