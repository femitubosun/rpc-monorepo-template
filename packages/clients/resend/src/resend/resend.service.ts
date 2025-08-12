// Main exports for resend package

import Env from '@template/env';
import { makeLogger } from '@template/logging';
import { Resend } from 'resend';
import type { IResend, SendEmailOptions } from './__defs__';

const logger = makeLogger('Resend');

export class ResendService implements IResend {
  #client: Resend;
  constructor() {
    this.#client = new Resend(Env.RESEND_API_KEY);
  }

  async sendEmail(input: SendEmailOptions) {
    const { error } = await this.#client.emails.send(input);

    if (error) {
      logger.error('Could not send mail', error);
    }
  }
}
