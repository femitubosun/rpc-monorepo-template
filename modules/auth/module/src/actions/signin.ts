import { scheduleAction } from "@template/action";
import AuthAction from "@template/auth-action-defs";
import db from "@template/db";
import Env from "@template/env";
import { hashString } from "@template/hash-utils";
import module from "../_module";
import { generateOtp, getOtpExpiration } from "../logic";

module.registerHandlers({
  signIn: async ({ context, input, makeError }) => {
    const user = await db.user.findUnique({
      where: {
        email: input.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      throw makeError({
        type: "BAD_REQUEST",
        message: "Invalid Credentials",
        data: input,
      });
    }

    const otp = generateOtp();

    const tokenHash = await hashString(otp);
    const expiresAt = getOtpExpiration();

    await db.otp.updateMany({
      where: {
        type: "AUTH",
        userId: user.id,
        isUsed: false,
      },
      data: {
        isUsed: true,
      },
    });

    await Promise.all([
      db.otp.create({
        data: {
          tokenHash,
          type: "AUTH",
          userId: user.id,
          expiresAt,
        },
        select: {
          id: true,
        },
      }),
      scheduleAction(AuthAction.mail.sendSignInCode, {
        context,
        input: {
          email: user.email,
          name: user.name ?? user.email.split("@")[0],
          otp: otp,
        },
      }),
    ]);

    return {
      context,
      data: {
        message: `Check email for further instructions`,
        ...(["development", "testing"].includes(Env.NODE_ENV) ? { otp } : {}),
      },
    };
  },
});
