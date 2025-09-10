import { Env } from '@template/env';
import { makeLogger } from '@template/logging';
import Redis from 'ioredis';

const logger = makeLogger('Redis');

let _redis: Redis | undefined;
let _shouldConnect: boolean | undefined;

function shouldConnectToRedis(): boolean {
  if (_shouldConnect !== undefined) return _shouldConnect;

  _shouldConnect =
    Env.NODE_ENV !== 'testing' ||
    process.env.REDIS_INTEGRATION_TESTS === 'true';

  return _shouldConnect;
}

export function getRedis(): Redis {
  if (!_redis) {
    if (!shouldConnectToRedis()) {
      return createMockRedis();
    }

    _redis = new Redis({
      host: Env.REDIS_HOST,
      port: Env.REDIS_PORT,
      password: Env.REDIS_PASSWORD,
      username: Env.REDIS_USERNAME,
      family: Env.REDIS_FAMILY,
    });

    setupRedisEvents(_redis);
  }

  return _redis;
}

function createMockRedis(): Redis {
  const store = new Map<string, string>();
  const sets = new Map<string, Set<string>>();

  return {
    get: async (key: string) => store.get(key) || null,
    set: async (key: string, value: string) => {
      store.set(key, value);
      return 'OK';
    },
    setex: async (key: string, _ttl: number, value: string) => {
      store.set(key, value);
      return 'OK';
    },
    del: async (...keys: string[]) => {
      let deleted = 0;
      keys.forEach((k) => {
        if (store.delete(k)) deleted++;
        sets.delete(k);
      });
      return deleted;
    },
    sadd: async (key: string, ...members: string[]) => {
      if (!sets.has(key)) sets.set(key, new Set());
      const set = sets.get(key)!;
      let added = 0;
      members.forEach((member) => {
        if (!set.has(member)) {
          set.add(member);
          added++;
        }
      });
      return added;
    },
    smembers: async (key: string) => {
      const set = sets.get(key);
      return set ? Array.from(set) : [];
    },
    scan: async (cursor: string, ..._args: unknown[]) => {
      if (cursor === '0') {
        return ['0', Array.from(store.keys())];
      }
      return ['0', []];
    },
    disconnect: () => {},
    on: () => {},
  } as unknown as Redis;
}

function setupRedisEvents(redis: Redis) {
  redis.on('connect', () => logger.info('Redis connected'));
  redis.on('error', (err) => logger.error('Redis Error', err));
  redis.on('ready', () => logger.info('Redis Ready'));

  // Graceful shutdown
  const cleanup = () => {
    logger.warn(`Redis connection terminated`);
    redis.disconnect();
  };

  process.on('SIGTERM', cleanup);
  process.on('SIGINT', cleanup);
}

// For testing - allows forcing connection state
export function setRedisConnection(connect: boolean) {
  _shouldConnect = connect;
  _redis = undefined;
}
