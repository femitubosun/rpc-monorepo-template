export interface SendEmailOptions {
  from: string;
  to: string[];
  subject: string;
  html: string;
}

export interface IResend {
  sendEmail(input: SendEmailOptions): Promise<void>;
}
