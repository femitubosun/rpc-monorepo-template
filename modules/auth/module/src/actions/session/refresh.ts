import {
  getSessionTtl,
  makeSessionKey,
  makeSessionObject,
} from '@template/api-utils';

import type { SessionSchema } from '@template/app-defs';
import cache from '@template/cache';
import module from '../../_module';

module.registerHandlers({
  session: {
    refresh: async ({ context, input, makeError }) => {
      const sessionKey = makeSessionKey(input.id);

      const currSession = await cache.get<SessionSchema>(sessionKey);

      if (!currSession) {
        throw makeError({
          type: 'NOT_FOUND',
          message: 'Session not found',
        });
      }

      const newVersion = currSession.version + 1;

      const newSession = makeSessionObject(input, newVersion);

      await cache.set(sessionKey, newSession, getSessionTtl());

      return {
        data: newSession,
        context,
      };
    },
  },
});
