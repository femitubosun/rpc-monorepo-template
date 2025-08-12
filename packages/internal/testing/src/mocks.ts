import { faker } from '@faker-js/faker';
import type {
  AppContext,
  Logger,
} from '@template/app-defs';
import { ckMaker } from '@template/cache-utils';
import { makeError } from '@template/error';

export function createMockUser() {
  return {
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    createdAt: faker.date.recent(),
  };
}

export function createMockApiResponse<T>(
  data: T,
  success = true
) {
  return {
    data,
    message: success ? 'Success' : 'Error',
    success,
  };
}

export function createMockContext(): AppContext {
  return {
    userId: faker.string.uuid(),
    developerId: faker.string.uuid(),
  };
}

export function createMockLogger(): Logger {
  return {
    log: (_msg: string, _meta?: any): void => {},
    info: (_msg: string, _meta?: any): void => {},
    warn: (_msg: string, _meta?: any): void => {},
    error: (_msg: string, _meta?: any): void => {},
    debug: (_msg: string, _meta?: any): void => {},
    child: (_ctx: any): any => null,
  };
}

export function createMockMakeError() {
  return (_args: any): any => {};
}

export function createMockSession() {
  return {
    user: createMockUser(),
    version: faker.number.int(),
  };
}

export function createMockCacheKey() {
  return ckMaker('test.action');
}

export function createActionMocks() {
  const mockDeveloper = {
    id: faker.string.uuid(),
  };

  return {
    cacheKey: createMockCacheKey(),
    context: {
      userId: faker.string.uuid(),
      developerId: mockDeveloper.id,
    },
    logger: createMockLogger(),
    makeError,
  };
}
