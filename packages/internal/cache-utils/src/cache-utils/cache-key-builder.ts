import { z } from 'zod';

export const dotSeparatedWordsSchema = z
  .string()
  .regex(/^[a-zA-Z-]+(\.[a-zA-Z-]+)+$/);
export type DotSeparatedWords = z.infer<typeof dotSeparatedWordsSchema>;

export class ActionCacheKey {
  private segments: string[] = [];
  private parameters: Record<string, any> = {};
  private ownerParam?: string;
  private prefix: string;

  constructor(action: string) {
    const validatedActionName = ActionCacheKey.validateAction(action);

    this.prefix = this.#dotToColumn(validatedActionName);
  }

  static validateAction(action: string): DotSeparatedWords {
    return dotSeparatedWordsSchema.parse(action);
  }

  #dotToColumn(input: string) {
    return input.replaceAll('.', ':');
  }

  owner(input: string) {
    this.ownerParam = input;
    return this;
  }

  /**
   * Key for a single item within the current module by its identifier
   */
  single(itemId: string | number): ActionCacheKey {
    this.segments.push(String(itemId));
    return this;
  }

  /**
   * Add parameters to the cache key
   */
  listParams(parameters: Record<string, any>): ActionCacheKey {
    this.parameters = {
      ...this.parameters,
      ...this.#sortObjectKeys(parameters),
    };
    return this;
  }

  /**
   * Build the final cache key string
   */
  toString(): string {
    const baseKey = this.#makeBaseKey();

    if (!Object.keys(this.parameters).length) {
      return baseKey;
    }

    return this.#addParamsToBaseKey(baseKey);
  }

  #makeOwnerSegment() {
    return this.ownerParam ? `:${this.ownerParam}` : '';
  }

  #makeSegementString() {
    return this.segments.length ? `:${this.segments.join(':')}` : '';
  }

  #makeBaseKey() {
    return `${this.prefix}${this.#makeOwnerSegment()}${this.#makeSegementString()}`;
  }

  #addParamsToBaseKey(baseKey: string) {
    if (!Object.keys(this.parameters).length) {
      return baseKey;
    }

    const paramString = Object.entries(this.parameters)
      .map(([k, v]) => `${k}=${encodeURIComponent(this.#serializeValue(v))}`)
      .join('&');

    return `${baseKey}:${paramString}`;
  }

  get ownerTag() {
    if (this.#makeOwnerSegment()) {
      return `${this.moduleTag}${this.#makeOwnerSegment()}`;
    }

    return this.prefix;
  }

  get moduleTag() {
    return this.prefix.split(':')[0];
  }

  /**
   * Serializes a value to a string for cache key generation
   */
  #serializeValue(value: any): string {
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
  #sortObjectKeys(obj: Record<string, any>): Record<string, any> {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    return Object.keys(obj)
      .sort()
      .reduce(
        (result, key) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          const value = obj[key];
          if (
            typeof value === 'object' &&
            value !== null &&
            !Array.isArray(value)
          ) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            result[key] = this.#sortObjectKeys(value);
          } else if (Array.isArray(value)) {
            result[key] = value?.map((item) =>
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              typeof item === 'object' && item !== null && !Array.isArray(item)
                ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                  this.#sortObjectKeys(item)
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
export const ckMaker = (action: string) => new ActionCacheKey(action);
