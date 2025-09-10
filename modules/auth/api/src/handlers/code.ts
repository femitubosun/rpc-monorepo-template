import { callAction } from '@template/action';
import AuthAction from '@template/auth-action-defs';
import type { ModuleRouterHandler } from '@template/router';
import type router from '../router';

export const code: ModuleRouterHandler<typeof router.code> = {
  use: async (c) => {
    const input = c.req.valid('json');

    const { data } = await callAction(AuthAction.useCode, {
      input,
      context: {},
    });

    return c.json(data, 200);
  },
};
