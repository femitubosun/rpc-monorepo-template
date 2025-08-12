import type { z } from 'zod';

export function makeDefinition<
  T extends Record<string, z.ZodType>,
>(obj: T) {
  return obj;
}

export function validateEnv(
  env: Record<string, any>,
  schema: z.ZodObject<any>
) {
  // TODO try catch, present error nicely. and then exit.
  return schema.parseAsync(env);
}
