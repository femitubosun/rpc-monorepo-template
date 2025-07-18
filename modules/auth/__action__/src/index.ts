import { A, G } from '@template/action';
import { MessageSchema } from '@template/app-defs';
import {
  AuthResponseSchema,
  SendOnboardingMailSchema,
  SendSignInCodeMailSchema,
  SignupRequestSchema,
  SignupResponseSchema,
  UseCodeSchema,
} from '@template/auth-defs';
import z from 'zod';
import { session } from './session';

const EmailSchema = z.object({
  email: z.string(),
});

const AuthAction = G({
  signup: A('auth.signup')
    .input(SignupRequestSchema)
    .output(SignupResponseSchema),

  signIn: A('auth.signIn')
    .input(EmailSchema)
    .output(MessageSchema),

  logout: A('auth.logout').output(
    z.object({
      message: z.string(),
    })
  ),

  mail: {
    sendOnboardingMail: A(
      'auth.mail.sendOnboardingMail'
    ).input(SendOnboardingMailSchema),
    sendSignInCode: A('auth.mail.sendSignInCode').input(
      SendSignInCodeMailSchema
    ),
  },
  useCode: A('auth.useCode')
    .input(UseCodeSchema)
    .output(AuthResponseSchema),

  requestCode: A('auth.requestCode')
    .input(EmailSchema)
    .output(MessageSchema),

  session,
});

export default AuthAction;
