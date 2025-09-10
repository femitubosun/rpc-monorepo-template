import { callAction } from '@template/action';
import { getAppActor } from '@template/api-utils';
import type { HonoRequest } from '@template/app-defs';
import AssetsActions from '@template/assets-action-defs';
import type { ModuleRouterHandler } from '@template/router';
import type router from '../router';

export const _handlers: ModuleRouterHandler<typeof router> = {
  create: async (c) => {
    const { context } = await getAppActor(c.req as unknown as HonoRequest);

    const input = c.req.valid('json');

    const { data } = await callAction(AssetsActions.create, {
      context,
      input,
    });

    return c.json(data, 201);
  },

  verify: async (c) => {
    const { context } = await getAppActor(c.req as unknown as HonoRequest);

    const { id } = c.req.valid('param');

    const { data } = await callAction(AssetsActions.verify, {
      context,
      input: {
        id,
      },
    });

    return c.json(data, 200);
  },
};
