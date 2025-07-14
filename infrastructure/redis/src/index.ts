import { Env } from '@template/env';
import { makeLogger } from '@template/logging';
import Redis from 'ioredis';

const logger = makeLogger('Redis');

export const redis = new Redis({
  host: Env.REDIS_HOST,
  port: Env.REDIS_PORT,
  password: Env.REDIS_PASSWORD,
  username: Env.REDIS_USERNAME,
  family: Env.REDIS_FAMILY,
});

export { Redis };

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error('Redis Error', err);
});

redis.on('ready', () => {
  logger.info('Redis Ready');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.warn(`Redis connection terminated`);
  redis.disconnect();
});

process.on('SIGINT', () => {
  logger.warn(`Redis connection interrupted`);
  redis.disconnect();
});

export default redis;
