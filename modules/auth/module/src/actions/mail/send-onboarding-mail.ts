import mail from '@template/mail';
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
        await mail.sendWelcomeMail(email, name);
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
