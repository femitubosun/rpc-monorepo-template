import { callAction } from '@template/action';
import { getAppActor } from '@template/api-utils';
import AuthAction from '@template/auth-action-defs';
import type { ModuleRouterHandler } from '@template/router';
import type router from '../router';
import { code } from './code';

export const _handlers: ModuleRouterHandler<typeof router> =
  {
    signup: async (c) => {
      const input = c.req.valid('json');

      const { data } = await callAction(AuthAction.signup, {
        input,
        context: {},
      });

      return c.json(data, 201);
    },

    signIn: async (c) => {
      const input = c.req.valid('json');

      const { data } = await callAction(AuthAction.signIn, {
        input,
        context: {},
      });

      return c.json(data, 200);
    },

    logout: async (c) => {
      const { context } = await getAppActor(c.req);

      const { data } = await callAction(AuthAction.logout, {
        context,
        input: undefined,
      });

      return c.json(data, 200);
    },
    code,
  };
