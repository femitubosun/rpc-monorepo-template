import { Env } from '@template/env';
import { makeLogger } from '@template/logging';
import redis from '@template/redis';

const TAG_SET_PREFIX = 'tagset:';
const makeKey = (key: string) => `${Env.APP_NAME}:${key}`;
const logger = makeLogger('Cache');

export const cache = {
  /**
   * Fetches data from cache if available, otherwise resolves it and caches the result.
   * Implements cache-first retrieval.
   * @param args Arguments for the key builder and resolver.
   * @param config Configuration object containing key builder, resolver, and optional tags.
   * @returns The resolved data.
   */
  async fetch<TResult>(config: {
    key: string;
    resolver: () => Promise<TResult>;
    tags?: string[];
    ttlSeconds?: number;
  }): Promise<TResult> {
    const cacheKey = makeKey(config.key);

    const cachedValue = await redis.get(cacheKey);
    if (cachedValue !== null) {
      logger.log(`Cache HIT for key: ${cacheKey}`);
      return JSON.parse(cachedValue) as TResult;
    }

    logger.log(
      `Cache MISS for key: ${cacheKey}. Fetching from resolver.`
    );
    const result = await config.resolver();

    if (config.ttlSeconds) {
      await redis.setex(
        cacheKey,
        config.ttlSeconds,
        JSON.stringify(result)
      );
    } else {
      await redis.set(cacheKey, JSON.stringify(result));
    }

    if (config.tags && config.tags.length > 0) {
      for (const tag of config.tags) {
        const tagSetKey = `${TAG_SET_PREFIX}${tag}`;
        await redis.sadd(tagSetKey, cacheKey);
      }
    }

    return result;
  },

  /**
   * Invalidates one or more cache keys.
   * @param keys A single key or an array of keys to invalidate.
   */
  async invalidate(keys: string | string[]): Promise<void> {
    const keysToDelete = Array.isArray(keys)
      ? keys.map((k) => makeKey(k))
      : [makeKey(keys)];

    if (keysToDelete.length === 0) {
      return;
    }

    await redis.del(...keysToDelete);
    logger.log(
      `Invalidated key(s): ${keysToDelete.join(', ')}`
    );
  },

  /**
   * Invalidates all cache keys matching a given prefix.
   * WARNING: Uses SCAN, which can be slow on large Redis datasets.
   * @param prefix The prefix to match (e.g., "transactions:user:").
   */
  async invalidateByPrefix(prefix: string): Promise<void> {
    logger.log(
      `Attempting to invalidate keys with prefix: ${prefix}`
    );
    const keysToDelete: string[] = [];

    const scanPattern = makeKey(
      prefix.endsWith('*') ? prefix : `${prefix}*`
    );

    let cursor = '0';
    do {
      const result = await redis.scan(
        cursor,
        'MATCH',
        scanPattern
      );
      cursor = result[0];
      const keys = result[1];
      for (const key of keys) {
        if (!key.startsWith(TAG_SET_PREFIX)) {
          keysToDelete.push(key);
        }
      }
    } while (cursor !== '0');

    if (keysToDelete.length > 0) {
      await redis.del(...keysToDelete);
      logger.log(
        `Invalidated ${keysToDelete.length} keys with prefix ${prefix}:`,
        keysToDelete
      );
    } else {
      logger.log(`No keys found with prefix: ${prefix}`);
    }
  },

  /**
   * Invalidates all cache keys associated with given tag(s).
   * @param tags A single tag or array of tags to invalidate.
   */
  async invalidateByTag(
    tags: string | string[]
  ): Promise<void> {
    const tagArray = Array.isArray(tags) ? tags : [tags];
    const allKeysToInvalidate = new Set<string>();
    const tagSetKeys: string[] = [];

    for (const tag of tagArray) {
      const tagSetKey = `${TAG_SET_PREFIX}${tag}`;
      tagSetKeys.push(tagSetKey);
      logger.log(
        `Attempting to invalidate keys for tag: ${tag} (set key: ${tagSetKey})`
      );

      const keysForTag = await redis.smembers(tagSetKey);
      keysForTag.forEach((key) =>
        allKeysToInvalidate.add(key)
      );

      if (keysForTag.length > 0) {
        logger.log(
          `Found ${keysForTag.length} keys for tag ${tag}:`,
          keysForTag
        );
      } else {
        logger.log(`No keys found for tag: ${tag}`);
      }
    }

    if (allKeysToInvalidate.size > 0) {
      const allKeysToDelete = [
        ...allKeysToInvalidate,
        ...tagSetKeys,
      ];
      await redis.del(...allKeysToDelete);

      logger.log(
        `Invalidated ${allKeysToInvalidate.size} keys and removed ${tagSetKeys.length} tag sets.`
      );
    } else {
      logger.log(
        `No keys found for any of the provided tags.`
      );
    }
  },

  /**
   * Sets a value in Redis.
   * @param key
   * @param value
   * @param ttlSeconds
   */
  async set(
    key: string,
    value: unknown,
    ttlSeconds?: number
  ) {
    const cacheKey = makeKey(key);
    if (ttlSeconds) {
      return redis.setex(
        cacheKey,
        ttlSeconds,
        JSON.stringify(value)
      );
    } else {
      return redis.set(cacheKey, JSON.stringify(value));
    }
  },

  /**
   * Retrieves a value from cache by key.
   * @param key The key to retrieve.
   * @returns The value if found, otherwise null.
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(makeKey(key));
    return value ? (JSON.parse(value) as T) : null;
  },

  /**
   * Deletes one or more keys from cache.
   * @param key
   */
  async delete(key: string | string[]) {
    const keysToDel = Array.isArray(key)
      ? key.map((k) => makeKey(k))
      : [makeKey(key)];

    return redis.del(...keysToDel);
  },
};
