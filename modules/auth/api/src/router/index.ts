import { MessageSchema } from '@template/app-defs';
import { SignupResponseSchema } from '@template/auth-defs';
import { Route } from '@template/router';
import z from 'zod';
import { code } from './code';
import { github } from './github';
import { google } from './google';

const EmailSchema = z.object({
  email: z.string().email(),
});

export const _router = {
  signup: Route.post('/auth/signup')
    .jsonBody(EmailSchema)
    .tags(['Auth'])
    .jsonResponse(201, 'Signup successful', SignupResponseSchema)
    .build(),

  signIn: Route.post('auth/sign-in')
    .jsonBody(EmailSchema)
    .jsonResponse(200, 'Sign in Request', MessageSchema)
    .tags(['Auth'])
    .build(),

  logout: Route.get('/auth/logout')
    .tags(['Auth'])
    .jsonResponse(200, 'Logout Successful', MessageSchema)
    .build(),

  code,
  github,
  google,
} as const;

export default _router;
