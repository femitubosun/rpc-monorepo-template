import z from 'zod';

export const GenerateGoogleAuthUrlInputSchema = z.object({
  sessionId: z.string().optional(),
  redirectUri: z.string().url().optional(),
});

export const GenerateGoogleAuthUrlOutputSchema = z.object({
  sessionId: z.string(),
  authUrl: z.string(),
});

export const HandleGoogleCallbackInputSchema = z.object({
  code: z.string(),
  state: z.string(),
  sessionId: z.string(),
});

export const FetchGoogleProfileInput = z.object({
  token: z.string(),
});

export const FetchGoogleProfileOutput = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().email().nullish(),
  avatarUrl: z.string().url().nullish(),
  verified_email: z.boolean().nullish(),
});
