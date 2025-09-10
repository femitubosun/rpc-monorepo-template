import { makeSessionKey } from '@template/api-utils';
import type { SessionSchema } from '@template/app-defs';
import cache from '@template/cache';
import module from '../../_module';

module.registerHandlers({
  session: {
    get: async ({ context, input }) => {
      const sessionKey = makeSessionKey(input.userId);

      const data = await cache.get<SessionSchema>(sessionKey);

      if (!data) {
        return {
          data: null,
          context,
        };
      }
      return {
        data,
        context,
      };
    },
  },
});
