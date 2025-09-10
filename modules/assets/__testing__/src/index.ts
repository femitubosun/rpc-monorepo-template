import { setUpTestEnvironment } from '@template/testing';
import { beforeAll, describe, it } from 'vitest';

describe('Assets Test', () => {
  beforeAll(async () => {
    await setUpTestEnvironment();
  }, 3000);

  it('should be defined', async () => {
    // const handler = module.getHandler(AuthAction.signup)!;
    //  expect(handler).toBeDefined();
  });
});
