import AuthAction from '@template/auth-action-defs';
import module from '@template/auth-module';
import cache from '@template/cache';
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from '@template/testing';
import {
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
} from 'vitest';

describe('auth.session.get Test', async () => {
  let handler: ReturnType<
    typeof module.getHandler<typeof AuthAction.session.get>
  >;
  const userId = faker.string.uuid();
  const user = {
    id: userId,
    email: faker.internet.email(),
    name: faker.person.fullName(),
    developerProfile: {
      id: faker.string.uuid(),
    },
  };

  beforeAll(async () => {
    await setUpTestEnvironment();
    handler = module.getHandler(AuthAction.session.get);
  });

  afterEach(async () => {
    await cache.delete(`session:${userId}`);
  });

  it('should return null when session does not exist', async () => {
    const result = await handler!({
      ...createActionMocks(),
      input: {
        userId,
      },
    });

    expect(result).toMatchObject({
      data: null,
    });
  });

  it('should return session when it exists', async () => {
    const sessionData = {
      user,
      version: 1,
    };

    await cache.set(`session:${userId}`, sessionData);

    const result = await handler!({
      ...createActionMocks(),
      input: {
        userId,
      },
    });

    expect(result).toMatchObject({
      data: sessionData,
    });
  });
});
