import AuthAction from '@template/auth-action-defs';
import module from '@template/auth-module';
import cache from '@template/cache';
import db from '@template/db';
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from '@template/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

describe('Auth.logout', async () => {
  let handler: ReturnType<typeof module.getHandler<typeof AuthAction.logout>>;

  beforeAll(async () => {
    await setUpTestEnvironment();
    handler = module.getHandler(AuthAction.logout);
  });

  afterEach(async () => {
    await db.user.deleteMany({});
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should logout successfully and return success message', async () => {
    const userId = faker.string.uuid();

    const result = await handler!({
      ...createActionMocks(),
      context: {
        userId,
      },
      input: {},
    });

    expect(result).toMatchObject({
      data: {
        message: 'logout successful',
      },
      context: {
        userId,
      },
    });
  });

  it('should delete session from cache', async () => {
    const userId = faker.string.uuid();

    await handler!({
      ...createActionMocks(),
      context: {
        userId,
      },
      input: {},
    });

    expect(await cache.get(`session:${userId}`)).toBeNull();
  });

  it('should handle logout with different user IDs', async () => {
    const userId1 = faker.string.uuid();
    const userId2 = faker.string.uuid();

    await handler!({
      ...createActionMocks(),
      context: {
        userId: userId1,
      },
      input: {},
    });

    await handler!({
      ...createActionMocks(),
      context: {
        userId: userId2,
      },
      input: {},
    });

    expect(await cache.get(`session:${userId1}`)).toBeNull();
    expect(await cache.get(`session:${userId2}`)).toBeNull();
  });
});
