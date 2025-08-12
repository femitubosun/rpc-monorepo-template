export class CacheKeyBuilder {
  private segments: string[] = [];
  private parameters: Record<string, any> = {};

  constructor(module: string, version: string = 'v1') {
    if (!module || module.trim() === '') {
      throw new Error(
        'Module cannot be empty for CacheKeyBuilder.'
      );
    }
    if (!version || version.trim() === '') {
      throw new Error(
        'Version cannot be empty for CacheKeyBuilder.'
      );
    }
    this.segments.push(
      `${module.trim()}:${version.trim()}`
    );
  }

  /**
   * Key for a list of items within the current module
   */
  list(): CacheKeyBuilder {
    this.segments.push('list');
    return this;
  }

  /**
   * Key for a single item within the current module by its identifier
   */
  single(itemId: string | number): CacheKeyBuilder {
    this.segments.push('single', String(itemId));
    return this;
  }

  /**
   * Key for a list of items specific to a user
   */
  userList(userId: string | number): CacheKeyBuilder {
    this.segments.push('user', String(userId), 'list');
    return this;
  }

  /**
   * Prefix for all data related to a specific user within the current module.
   * Example (module "transactions"): "transactions:v1:user:456"
   */
  userPrefix(userId: string | number): CacheKeyBuilder {
    this.segments.push('user', String(userId));

    return this;
  }

  /**
   * Key for a single item, explicitly namespaced under a user
   */
  userSingle(
    userId: string | number,
    itemId: string | number
  ): CacheKeyBuilder {
    this.segments.push(
      'user',
      String(userId),
      'single',
      String(itemId)
    );
    return this;
  }

  /**
   * Add parameters to the cache key
   */
  params(parameters: Record<string, any>): CacheKeyBuilder {
    this.parameters = {
      ...this.parameters,
      ...this.sortObjectKeys(parameters),
    };
    return this;
  }

  /**
   * Build the final cache key string
   */
  make(): string {
    const baseKey = this.segments.join(':');

    if (Object.keys(this.parameters).length === 0) {
      return baseKey;
    }

    const paramString = Object.entries(this.parameters)
      .map(
        ([k, v]) =>
          `${k}=${encodeURIComponent(this.serializeValue(v))}`
      )
      .join('&');

    return `${baseKey}?${paramString}`;
  }

  /**
   * Get prefix for invalidation strategies
   */
  getPrefix(): string {
    return this.segments.join(':');
  }

  /**
   * Get the versioned module prefix
   */
  getVersionedPrefix(): string {
    return this.segments[0];
  }

  /**
   * Serializes a value to a string for cache key generation
   */
  private serializeValue(value: any): string {
    if (value === null || value === undefined) {
      return String(value);
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  /**
   * Sorts the keys of an object alphabetically (deep sort)
   */
  private sortObjectKeys(
    obj: Record<string, any>
  ): Record<string, any> {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    return Object.keys(obj)
      .sort()
      .reduce(
        (result, key) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const value = obj[key];
          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            result[key] = this.sortObjectKeys(value);
          } else if (Array.isArray(value)) {
            result[key] = value?.map((item) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              typeof item === 'object' &&
              item !== null &&
              !Array.isArray(item)
                ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  this.sortObjectKeys(item)
                : item
            );
          } else {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            result[key] = value;
          }
          return result;
        },
        {} as Record<string, any>
      );
  }
}

/**
 * Factory function to create a new CacheKeyBuilder instance
 */
export const ckMaker = (
  module: string,
  version: string = 'v1'
) => new CacheKeyBuilder(module, version);
