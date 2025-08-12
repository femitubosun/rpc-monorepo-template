import { ContextUserSchema } from "@template/app-defs";
import db from "@template/db";
import { zodToPrismaSelect } from "@template/db-utils";
import { verifyString } from "@template/hash-utils";
import module from "../_module";
import { createSessionForUser } from "../logic";

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
        message: "Invalid credentials",
        type: "BAD_REQUEST",
        data: input,
      });
    }

    const otpToken = await db.otp.findFirst({
      where: {
        userId: user.id,
        expiresAt: {
          gt: new Date(),
        },
        type: "AUTH",
        isUsed: false,
      },
      select: {
        id: true,
        tokenHash: true,
      },
    });

    if (!otpToken) {
      throw makeError({
        message: "Invalid credentials",
        type: "BAD_REQUEST",
        data: input,
      });
    }

    const isValidOtp = await verifyString(otpToken.tokenHash, input.otp);

    if (!isValidOtp) {
      throw makeError({
        message: "Invalid credentials",
        type: "BAD_REQUEST",
        data: input,
      });
    }

    const [token, _] = await Promise.all([
      createSessionForUser(user, context),
      db.otp.updateMany({
        where: {
          OR: [
            {
              id: otpToken.id,
            },
            {
              expiresAt: {
                lte: new Date(),
              },
            },
            {
              type: "AUTH",
            },
          ],
        },
        data: {
          isUsed: true,
        },
      }),
    ]);

    return {
      data: {
        user,
        token,
      },
      context,
    };
  },
});
