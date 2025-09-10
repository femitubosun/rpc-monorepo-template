import AuthAction from '@template/auth-action-defs';
import module from '@template/auth-module';
import cache from '@template/cache';
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from '@template/testing';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';

describe('auth.session.create Test', async () => {
  let handler: ReturnType<
    typeof module.getHandler<typeof AuthAction.session.create>
  >;
  const user = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
  };

  beforeAll(async () => {
    await setUpTestEnvironment();
    handler = module.getHandler(AuthAction.session.create);
  });

  afterEach(async () => {
    await cache.delete(`session:${user.id}`);
  });

  it('should create a session', async () => {
    const result = await handler!({
      ...createActionMocks(),
      input: {
        user,
        version: 1,
      },
    });

    expect(result).toMatchObject({
      data: {
        user,
        version: 1,
      },
    });
  });

  it('should store session in cache', async () => {
    await handler!({
      ...createActionMocks(),
      input: {
        user,
        version: 1,
      },
    });

    const cachedSession = await cache.get(`session:${user.id}`);
    expect(cachedSession).toMatchObject({
      user,
      version: 1,
    });
  });
});
