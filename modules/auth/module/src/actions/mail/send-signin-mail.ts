import mail from "@template/mail";
import module from "../../_module";

module.registerHandlers({
  mail: {
    sendSignInCode: async ({ input, context, logger }) => {
      const { email, otp } = input;

      try {
        await mail.sendLoginOtp("", email, otp);
      } catch (e) {
        logger.error(`Error sending email`, e);
      }

      return {
        context,
        data: null,
      };
    },
  },
});
