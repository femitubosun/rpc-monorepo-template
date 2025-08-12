import z from 'zod';

export const GenerateGithubAuthUrlInputSchema = z.object({
  sessionId: z.string().optional(),
});

export const GenerateGithubAuthUrlOutputSchema = z.object({
  sessionId: z.string(),
  authUrl: z.string(),
});

export const HandleCallbackInputSchema = z.object({
  code: z.string(),
  state: z.string(),
  sessionId: z.string(),
});

export const FetchGithubProfileInput = z.object({
  token: z.string(),
});

export const FetchGithubProfileOutput = z.object({
  id: z.string(),
  name: z.string().nullish(),
  email: z.string().nullish(),
  avatarUrl: z.string(),
});
