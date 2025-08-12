import z from 'zod';
import { makeDefinition } from '../utils';

const AUTH = makeDefinition({
  OTP_EXPIRES_IN_MINUTES: z.coerce.number().default(10),

  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_REDIRECT_URL: z.string().url(),
  GITHUB_REQUEST_IDENTITY_URL: z.string().url(),
  GITHUB_REQUEST_TOKEN_URL: z.string().url(),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REQUEST_IDENTITY_URL: z.string().url(),
  GOOGLE_REQUEST_TOKEN_URL: z.string().url(),
  GOOGLE_USER_INFO_URL: z.string().url(),
});

export default AUTH;
