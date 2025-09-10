import { callAction, scheduleAction } from '@template/action';
import { ContextUserSchema } from '@template/app-defs';
import AuthAction from '@template/auth-action-defs';
import type { OauthSession } from '@template/auth-defs';
import cache from '@template/cache';
import db from '@template/db';
import { zodToPrismaSelect } from '@template/db-utils';
import github from '@template/github';
import module from '../../_module';
import { createSessionForUser, makeOauthSessionCacheKey } from '../../logic';

module.registerHandlers({
  github: {
    handleCallbackUrl: async ({ context, input, makeError }) => {
      const sessionCk = makeOauthSessionCacheKey(input.sessionId);

      const cachedSession = await cache.get<OauthSession>(sessionCk);

      if (!cachedSession) {
        throw makeError({
          type: 'NOT_FOUND',
          message: 'Oauth Session not found',
          data: input,
        });
      }

      if (input.state !== cachedSession.state) {
        throw makeError({
          type: 'BAD_REQUEST',
          message: 'State mismatch',
        });
      }

      const authResponse = await github.requestAuthenticationToken({
        code: input.code,
        codeVerifier: cachedSession.codeVerifier,
      });

      if (!authResponse) {
        throw makeError({
          type: 'INTERNAL',
          message: 'Could not request auth token',
        });
      }

      await cache.delete(sessionCk);

      const { data: profile } = await callAction(
        AuthAction.github.getUserProfile,
        {
          input: {
            token: authResponse.access_token,
          },
          context: {},
        }
      );

      if (!profile.email) {
        throw makeError({
          type: 'BAD_REQUEST',
          message: 'Email is missing',
        });
      }

      const existingUser = await db.user.findFirst({
        where: {
          email: profile.email,
        },

        select: zodToPrismaSelect(ContextUserSchema),
      });

      if (existingUser) {
        const token = await createSessionForUser(existingUser, context);
        return {
          data: {
            user: existingUser,
            token,
          },
          context,
        };
      }

      const user = await db.user.create({
        data: {
          email: profile.email,
          authProvider: 'GITHUB',
          authProviderId: profile.id,
          name: profile.name,
          profileImgUrl: profile.avatarUrl,
        },
        select: zodToPrismaSelect(ContextUserSchema),
      });

      await scheduleAction(AuthAction.mail.sendOnboardingMail, {
        context,
        input: {
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
        },
      });

      const token = await createSessionForUser(user, context);

      return {
        data: {
          user,
          token,
        },
        context,
      };
    },
  },
});
