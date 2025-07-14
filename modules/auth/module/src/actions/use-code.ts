import { callAction } from '@template/action';
import { signJwt } from '@template/api-utils';
import { ContextUserSchema } from '@template/app-defs';
import AuthAction from '@template/auth-action-defs';
import db from '@template/db';
import { zodToPrismaSelect } from '@template/db-utils';
import { verifyString } from '@template/hash-utils';
import module from '../_module';

module.registerHandlers({
  useCode: async ({ context, input, makeError }) => {
    const user = await db.user.findUnique({
      where: {
        email: input.email,
      },
      select: zodToPrismaSelect(ContextUserSchema),
    });

    if (!user) {
      throw makeError({
        message: 'Invalid credentials',
        type: 'BAD_REQUEST',
        data: input,
      });
    }

    const otpToken = await db.otp.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
        type: 'AUTH',
        isUsed: false,
      },
      select: {
        id: true,
        tokenHash: true,
      },
    });

    if (!otpToken) {
      throw makeError({
        message: 'Invalid credentials',
        type: 'BAD_REQUEST',
        data: input,
      });
    }

    const isValidOtp = await verifyString(
      otpToken.tokenHash,
      input.otp
    );

    if (!isValidOtp) {
      throw makeError({
        message: 'Invalid credentials',
        type: 'BAD_REQUEST',
        data: input,
      });
    }

    const [{ data: existingSession }, _] =
      await Promise.all([
        callAction(AuthAction.session.get, {
          context,
          input: {
            userId: user.id,
          },
        }),
        db.otp.update({
          where: {
            id: otpToken.id,
          },
          data: {
            isUsed: true,
          },
          select: {
            id: true,
          },
        }),
      ]);

    const sessionVersion = existingSession?.version ?? 1;

    const { data: newSession } = await callAction(
      AuthAction.session.create,
      {
        input: {
          user,
          version: sessionVersion,
        },
        context,
      }
    );

    const token = signJwt(newSession);

    return {
      data: {
        user,
        token,
      },
      context,
    };
  },
});
