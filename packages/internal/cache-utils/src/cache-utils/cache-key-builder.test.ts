import { describe, expect, it } from 'vitest';
import z from 'zod';
import { ActionCacheKey } from './cache-key-builder';

describe('CacheKeyBuilder Test', () => {
  const userId = '01984afb-ad90-7268-aa80-112af0f9e638';
  const itemId = '01984afb-c7e8-747c-8201-6cb6a5ba1579';

  it('should be defined', () => {
    const cK = new ActionCacheKey('devProfile.get');

    expect(cK).toBeDefined();
  });

  it('should throw error for invalid action key', () => {
    expect(() => new ActionCacheKey('myAction')).toThrowError(z.ZodError);
  });

  it('should define action key', () => {
    const cK = new ActionCacheKey('devProfile.get');

    expect(cK.toString()).toBe('devProfile:get');
  });

  it('should properly define owner key', () => {
    const cK = new ActionCacheKey('devProfile.list');

    cK.owner(userId);
    expect(cK.toString()).toBe(`devProfile:list:${userId}`);
  });

  it('should properly define owner key for single item', () => {
    const cK = new ActionCacheKey('devProfile.get');

    cK.owner(userId).single(itemId);

    expect(cK.toString()).toBe(`devProfile:get:${userId}:${itemId}`);
  });

  it('should properly define owner key for listParams', () => {
    const cK = new ActionCacheKey('devProfile.list');

    cK.owner(userId).listParams({
      search: 'friends',
      about: true,
    });

    expect(cK.toString()).toBe(
      `devProfile:list:${userId}:about=true&search=friends`
    );
  });

  it('should define single key ', () => {
    const cK = new ActionCacheKey('devProfile.get');
    cK.single(itemId);

    expect(cK.toString()).toBe(`devProfile:get:${itemId}`);
  });

  it('should define a listParamsKey', () => {
    const cK = new ActionCacheKey('devProfile.list');
    cK.listParams({ all: true, before: 12 });

    expect(cK.toString()).toBe(`devProfile:list:all=true&before=12`);
  });

  it('should return appropriate ownerTag', () => {
    const cK = new ActionCacheKey('devProfile.get');

    cK.owner(userId).single(itemId);

    expect(cK.ownerTag).toBe(`devProfile:${userId}`);
  });

  it('should return moduleTag', () => {
    const ck = new ActionCacheKey('devProfile.get');

    ck.owner(userId).single(itemId);

    expect(ck.moduleTag).toBe('devProfile');
  });

  it('should return correct moduleTag for ck with ownerTag', () => {
    const cK = new ActionCacheKey('devProfile.get');

    cK.owner(userId).single(itemId);

    expect(cK.moduleTag).toBe('devProfile');
  });

  it('should return correct moduleTag for ck with listParams', () => {
    const cK = new ActionCacheKey('devProfile.list');
    cK.listParams({ all: true, before: 12 });

    expect(cK.moduleTag).toBe(`devProfile`);
  });
});
