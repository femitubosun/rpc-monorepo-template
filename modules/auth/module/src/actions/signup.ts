import { enqueueAction } from '@template/action';
import AuthAction from '@template/auth-action-defs';
import db from '@template/db';
import Env from '@template/env';
import { hashString } from '@template/hash-utils';
import module from '../_module';
import { generateOtp, getOtpExpiration } from '../logic';

module.registerHandlers({
  signup: async ({ input, context, makeError }) => {
    const { email } = input;

    const existingUser = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw makeError({
        type: 'CONFLICT',
        message: 'User already exists',
        data: input,
      });
    }

    const otp = generateOtp();

    const user = await db.user.create({
      data: {
        email,
        otpTokens: {
          create: {
            tokenHash: await hashString(otp),
            expiresAt: getOtpExpiration(),
            type: 'AUTH',
          },
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    await Promise.all([
      enqueueAction(AuthAction.mail.sendOnboardingMail, {
        context,
        input: {
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
        },
      }),
      enqueueAction(AuthAction.mail.sendSignInCode, {
        context,
        input: {
          email: user.email,
          otp: otp,
        },
      }),
    ]);

    return {
      context,
      data: {
        message: 'Signup successful',
        ...(Env.NODE_ENV === 'development' ? { otp } : {}),
      },
    };
  },
});
