import { enqueueAction } from '@template/action';
import AuthAction from '@template/auth-action-defs';
import db from '@template/db';
import { hashString } from '@template/hash-utils';
import module from '../_module';
import { generateOtp, getOtpExpiration } from '../logic';

module.registerHandlers({
  signIn: async ({ context, input, makeError }) => {
    const user = await db.user.findUnique({
      where: {
        email: input.email,
      },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      throw makeError({
        type: 'BAD_REQUEST',
        message: 'Invalid Credentials',
        data: input,
      });
    }

    const otp = generateOtp();

    await db.otp.create({
      data: {
        tokenHash: await hashString(otp),
        type: 'AUTH',
        user: {
          connect: {
            id: user.id,
          },
        },
        expiresAt: getOtpExpiration(),
      },
      select: {
        id: true,
      },
    });

    await enqueueAction(AuthAction.mail.sendSignInCode, {
      context,
      input: {
        email: user.email,
        otp: otp,
      },
    });

    return {
      context,
      data: {
        message: `Check email for further instructions`,
      },
    };
  },
});
