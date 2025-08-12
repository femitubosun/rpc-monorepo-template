import resend from "@template/resend";
import { generator } from "./mail-gen";

class Mail {
  async sendWelcomeMail(email: string, name: string) {
    const emailParams = {
      body: {
        name,
        greeting: "Thanks for signing up.",
        intro:
          "Axon is built to help you grow as a software engineer by showing you what’s holding your codebase — and your thinking — back.\n" +
          "\n" +
          "It’s not magic. It just looks closely at how you work, finds weak spots, and gives you clear, grounded suggestions to improve.\n" +
          "Less noise. More signal. \n Here's what to do next",
        action: [
          {
            instructions: "1. Upload a project or connect your repo",
            button: {
              color: "#22BC66",
              text: "Connect your repository",
              link: "https://axonai.com/connect-repository",
            },
          },

          {
            instructions: "2. Upload your resume or input your LinkedIn",
            button: {
              color: "#22BC66",
              text: "Upload resume",
              link: "https://axonai.com/upload-resume",
            },
          },

          {
            instructions: "3. Set your career goal",
            button: {
              color: "#22BC66",
              text: "Set your goal career goal",
              link: "https://axonai.com/career-goals",
            },
          },
        ],
        outro: `If you ever get stuck or want to push further, just ask. We’re building this for people who care about doing real work well.
        Welcome again — and talk soon.

        — The Axon Team`,
      },
    };

    const html: string = generator.generate(emailParams);

    await resend.sendEmail({
      subject: "Welcome to Axon AI",
      to: [email],
      html,
      from: "Axon AI <support@bexxletech.com>",
    });
  }

  async sendLoginOtp(name: string, email: string, otp: string) {
    const emailParams = {
      body: {
        name,
        greeting: `Hey ${name}, here’s your login code`,
        intro:
          "Use the one-time code below to log in to your Axon account. This code is valid for 10 minutes.",
        action: [
          {
            instructions: "Your one-time login code:",
            button: {
              color: "#22BC66",
              text: otp,
              link: "https://axonai.com/login",
            },
          },
        ],
        outro:
          "If you didn’t request this code, you can safely ignore this email.\n" +
          "Need help? Reach out to support@axonai.com.",
      },
    };

    const html: string = generator.generate(emailParams);

    await resend.sendEmail({
      subject: "Login to your AxonAI account",
      to: [email],
      html,
      from: "Axon AI <support@bexxletech.com>",
    });
  }
}

export default new Mail();
