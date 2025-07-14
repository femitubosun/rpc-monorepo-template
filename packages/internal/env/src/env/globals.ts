import { z } from 'zod';
import { makeDefinition } from './utils';

const GLOBALS = makeDefinition({
  NODE_ENV: z
    .enum([
      'development',
      'staging',
      'testing',
      'production',
    ])
    .default('production'),
  PORT: z.coerce.number().default(3000),
  APP_NAME: z.string().default('template'),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string().url().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_USERNAME: z.string().default(''),
  REDIS_FAMILY: z.coerce.number().default(0),

  BULLMQ_HOST: z.string().url().default('localhost'),
  BULLMQ_PORT: z.coerce.number().default(6379),
  BULLMQ_PASSWORD: z.string().default(''),
  BULLMQ_USERNAME: z.string().default(''),
  BULLMQ_FAMILY: z.coerce.number().default(0),

  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  SESSION_TTL_SECONDS: z.number().int(),
});

export default GLOBALS;
