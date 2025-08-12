// Main exports for resend package

import type { IResend, SendEmailOptions } from './__defs__';

export class ResendNoop implements IResend {
  async sendEmail(_input: SendEmailOptions) {
    return Promise.resolve();
  }
}
