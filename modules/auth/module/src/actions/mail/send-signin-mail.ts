import resend from '@template/resend';
import module from '../../_module';

module.registerHandlers({
  mail: {
    sendSignInCode: async ({ input, context, logger }) => {
      const { email, otp } = input;

      try {
        await resend.sendEmail({
          to: [email],
          from: 'your Project<onboarding@bexxletech.com>',
          subject: 'Login your Project Account',
          html: `<h1> Welcome to your Project </h1><h2> Here is your OTP ${otp}</h2> `,
        });
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
