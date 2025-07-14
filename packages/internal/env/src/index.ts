import type { z } from 'zod';
import { envDefinition } from './env';

export { config } from 'dotenv';

export const Env: z.output<typeof envDefinition> = {
  ...process.env,
} as unknown as z.output<typeof envDefinition>;

const defaults: Record<string, unknown> = Object.keys(
  envDefinition.shape
).reduce(
  (acc, next) => {
    const key = next as keyof typeof envDefinition.shape;
    const def = envDefinition.shape[key]._def;
    const value =
      'defaultValue' in def
        ? def.defaultValue?.()
        : undefined;
    return {
      // eslint-disable-line
      ...acc,
      [key]: value,
    };
    // eslint-disable-line
  },
  {} as Record<keyof typeof envDefinition.shape, any>
);

for (const key in envDefinition.shape) {
  const typedKey = key as keyof typeof envDefinition.shape;
  let value =
    process.env[key] ?? (defaults[key] as unknown);
  try {
    value = envDefinition.shape[typedKey].parse(value);
  } catch {}
  if (value !== undefined) {
    process.env[key] = String(value);
    // eslint-disable-line
    (Env as any)[key] = value;
  }
}

export default Env;
