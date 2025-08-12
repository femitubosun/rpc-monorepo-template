import Env from '@template/env';
import { Redis } from '@template/redis';

export const getRedisConn = () =>
  new Redis({
    host: Env.BULLMQ_HOST,
    port: Env.BULLMQ_PORT,
    password: Env.BULLMQ_PASSWORD,
    username: Env.BULLMQ_USERNAME,
    family: Env.BULLMQ_FAMILY,
    maxRetriesPerRequest: null,
  });
