import { randomBytes } from 'node:crypto';

export function generateSessionId() {
  return randomBytes(32).toString('hex');
}

export function makeOauthSessionCacheKey(
  sessionId: string
) {
  return `oauth-session:${sessionId}`;
}
