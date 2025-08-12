import { callAction } from '@template/action';
import { getCookie, setCookie } from '@template/api-utils';
import AuthAction from '@template/auth-action-defs';
import Env from '@template/env';
import type { ModuleRouterHandler } from '@template/router';
import {
  appendErrorToRedirectUrl,
  getSuccessRedirectUrl,
} from '../helpers/';
import type router from '../router';

const COOKIE_NAME = 'oauth_session_id';

export const google: ModuleRouterHandler<
  typeof router.google
> = {
  generateAuthUrl: async (c) => {
    const sessionId = getCookie(c, COOKIE_NAME);

    const { data } = await callAction(
      AuthAction.google.generateAuthUrl,
      {
        input: {
          sessionId,
        },
        context: {},
      }
    );

    const cookieOptions = {
      httpOnly: true,
      secure: Env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    } as const;

    setCookie(
      c,
      COOKIE_NAME,
      data.sessionId,
      cookieOptions
    );

    return c.json(
      {
        authUrl: data.authUrl,
      },
      200
    );
  },
  callback: async (c) => {
    const redirectUrl = new URL(Env.APP_URL);
    redirectUrl.pathname = `${redirectUrl.pathname.replace(/\/$/, '')}/auth`;

    try {
      const { state, code } = c.req.valid('query');

      const sessionId = getCookie(c, COOKIE_NAME);

      if (!sessionId) {
        return c.json({}, 500);
      }

      const { data } = await callAction(
        AuthAction.google.handleCallbackUrl,
        {
          context: {},
          input: {
            state,
            sessionId,
            code,
          },
        }
      );

      return c.redirect(
        getSuccessRedirectUrl(redirectUrl, data.token),
        302
      );
    } catch (e) {
      appendErrorToRedirectUrl(e, redirectUrl);
      return c.redirect(redirectUrl.toString(), 302);
    }
  },
};
