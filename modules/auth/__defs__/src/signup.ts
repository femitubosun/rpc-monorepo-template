import z from 'zod';

export const SignupRequestSchema = z.object({
  email: z.string(),
});

export const SignupResponseSchema = z.object({
  message: z.string(),
  otp: z.string().optional(),
});

export const SendOnboardingMailSchema = z.object({
  email: z.string(),
  name: z.string(),
});

export const SendSignInCodeMailSchema = z.object({
  email: z.string(),
  otp: z.string().min(6).max(6),
});
