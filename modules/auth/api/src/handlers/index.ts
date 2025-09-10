import { callAction } from '@template/action';
import { getAppActor } from '@template/api-utils';
import type { HonoRequest } from '@template/app-defs';
import AuthAction from '@template/auth-action-defs';
import type { ModuleRouterHandler } from '@template/router';
import type router from '../router';
import { code } from './code';
import { github } from './github';
import { google } from './google';

export const _handlers: ModuleRouterHandler<typeof router> = {
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
    const { context } = await getAppActor(c.req as unknown as HonoRequest);

    const { data } = await callAction(AuthAction.logout, {
      context,
      input: undefined,
    });

    return c.json(data, 200);
  },
  code,
  github,
  google,
};
