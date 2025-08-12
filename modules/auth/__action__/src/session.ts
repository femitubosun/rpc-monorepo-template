import { A, G } from '@template/action';
import {
  ContextUserSchema,
  SessionSchema,
} from '@template/app-defs';

import z from 'zod';

const userIdSchema = z.object({
  userId: z.string(),
});

export const session = G({
  create: A('auth.session.create')
    .input(
      z.object({
        user: ContextUserSchema,
        version: z.number(),
      })
    )
    .output(SessionSchema),
  invalidate: A('auth.session.invalidate')
    .input(userIdSchema)
    .output(z.null()),
  refresh: A('auth.session.refresh')
    .input(ContextUserSchema)
    .output(SessionSchema),
  get: A('auth.session.get')
    .input(userIdSchema)
    .output(SessionSchema.nullable()),
});
