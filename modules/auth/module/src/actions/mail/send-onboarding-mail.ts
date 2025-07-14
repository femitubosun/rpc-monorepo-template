import resend from '@template/resend';
import module from '../../_module';

module.registerHandlers({
  mail: {
    sendOnboardingMail: async ({
      input,
      context,
      logger,
    }) => {
      const { email, name } = input;

      try {
        await resend.sendEmail({
          to: [email],
          from: 'your Project<onboarding@bexxletech.com>',
          subject: 'Welcome to your Project',
          html: `<h1>HI ${name}, Welcome to your Project </h1><p>`,
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
