import { scheduleAction } from '@template/action';
import AuthAction from '@template/auth-action-defs';
import db from '@template/db';
import Env from '@template/env';
import { hashString } from '@template/hash-utils';
import module from '../_module';
import { generateOtp, getOtpExpiration } from '../logic';

module.registerHandlers({
  signup: async ({ input, context }) => {
    const { email } = input;

    await db.user.findUniqueOrThrow({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

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
      scheduleAction(AuthAction.mail.sendOnboardingMail, {
        context,
        input: {
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
        },
      }),
      scheduleAction(AuthAction.mail.sendSignInCode, {
        context,
        input: {
          email: user.email,
          name: user.name ?? user.email.split('@')[0],
          otp: otp,
        },
      }),
    ]);

    return {
      context,
      data: {
        message: 'Signup successful',
        ...(['development', 'testing'].includes(
          Env.NODE_ENV
        )
          ? { otp }
          : {}),
      },
    };
  },
});
