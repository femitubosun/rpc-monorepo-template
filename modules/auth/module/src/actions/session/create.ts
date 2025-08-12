import {
  getSessionTtl,
  makeSessionKey,
  makeSessionObject,
} from '@template/api-utils';
import cache from '@template/cache';
import module from '../../_module';

module.registerHandlers({
  session: {
    create: async ({ context, input }) => {
      const { user, version } = input;

      const sessionKey = makeSessionKey(user.id);
      const session = makeSessionObject(user, version);

      await cache.set(sessionKey, session, getSessionTtl());

      return {
        context,
        data: {
          user,
          version,
        },
      };
    },
  },
});
