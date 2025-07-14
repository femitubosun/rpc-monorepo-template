import { makeSessionKey } from '@template/api-utils';
import cache from '@template/cache';
import module from '../../_module';

module.registerHandlers({
  session: {
    invalidate: async ({ context, input }) => {
      const sessionKey = makeSessionKey(input.userId);

      await cache.delete(sessionKey);

      return {
        context,
        data: null,
      };
    },
  },
});
