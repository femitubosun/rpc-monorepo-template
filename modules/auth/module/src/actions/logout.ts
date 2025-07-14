import { makeSessionKey } from '@template/api-utils';
import cache from '@template/cache';
import module from '../_module';

module.registerHandlers({
  logout: async ({ context, logger }) => {
    logger.log(`User id ${context.userId}`);

    const sessionKey = makeSessionKey(context.userId!);
    await cache.delete(sessionKey);

    return {
      context,
      data: {
        message: 'logout successful',
      },
    };
  },
});
