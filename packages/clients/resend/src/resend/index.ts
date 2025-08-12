import Env from '@template/env';
import { ResendNoop } from './resend.noop';
import { ResendService } from './resend.service';

export const resend = ['testing'].includes(Env.NODE_ENV)
  ? new ResendNoop()
  : new ResendService();
