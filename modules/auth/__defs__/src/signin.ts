import { ContextUserSchema } from '@template/app-defs';
import z from 'zod';

export const UseCodeSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(6).max(6),
});

export const AuthResponseSchema = z.object({
  token: z.string(),
  user: ContextUserSchema,
});
