import { UserSchema } from '@template/prisma-defs';
import z from 'zod';

export type AppContext = {
  userId?: string;
  actionName?: string;
};

export interface Logger {
  log: (msg: string, meta?: any) => void;
  info: (msg: string, meta?: any) => void;
  warn: (msg: string, meta?: any) => void;
  error: (msg: string, meta?: any) => void;
  debug: (msg: string, meta?: any) => void;
  child: (ctx: any) => Logger;
}

export const ContextUserSchema = UserSchema.pick({
  id: true,
  email: true,
  name: true,
  profileImgUrl: true,
});

export type ContextUserSchema = z.infer<typeof ContextUserSchema>;

export const SessionSchema = z.object({
  user: ContextUserSchema,
  version: z.number().min(1),
});

export type SessionSchema = z.infer<typeof SessionSchema>;

export type { HonoRequest } from './app-defs';

export const MessageSchema = z.object({
  message: z.string(),
});

export type MessageSchema = z.infer<typeof MessageSchema>;

export const UserIdSchema = z.object({
  userId: z.string(),
});

export type UserIdSchema = z.infer<typeof UserIdSchema>;

export const IdSchema = z.object({
  id: z.string(),
});

export const DeletedOutputSchema = z.object({
  deleted: z.boolean(),
});

export const IdAndMaybeCreatorIdSchema = z.object({
  id: z.string(),
  creatorId: z.string().optional(),
});

export const IdAndMaybeBrandIdSchema = z.object({
  id: z.string(),
  brandId: z.string().optional(),
});
