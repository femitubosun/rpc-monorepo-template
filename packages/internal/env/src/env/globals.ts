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
  APP_NAME: z.string().default('axon-ai'),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().default(''),
  REDIS_USERNAME: z.string().default(''),
  REDIS_FAMILY: z.coerce.number().default(0),

  BULLMQ_HOST: z.string().default('localhost'),
  BULLMQ_PORT: z.coerce.number().default(6379),
  BULLMQ_PASSWORD: z.string().default(''),
  BULLMQ_USERNAME: z.string().default(''),
  BULLMQ_FAMILY: z.coerce.number().default(0),

  ADD_QUEUE_TO_ACTION: z
    .enum(['true', 'false'])
    .default('true')
    .transform((val) => val === 'true'),

  REDIS_INTEGRATION_TESTS: z
    .enum(['true', 'false'])
    .default('false')
    .transform((val) => val === 'true'),

  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  SESSION_TTL_SECONDS: z.coerce.number().int(),

  GOOGLE_GEMINI_API_KEY: z.string(),
});

export default GLOBALS;
