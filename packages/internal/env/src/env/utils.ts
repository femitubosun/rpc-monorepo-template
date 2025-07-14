import type { z } from 'zod';

export function makeDefinition<
  T extends Record<string, z.ZodType>,
>(obj: T) {
  return obj;
}
