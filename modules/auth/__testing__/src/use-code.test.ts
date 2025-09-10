import AuthAction from '@template/auth-action-defs';
import module from '@template/auth-module';
import db from '@template/db';
import * as hashUtils from '@template/hash-utils';
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from '@template/testing';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

describe('Auth.useCode Test', async () => {
  let handler: ReturnType<typeof module.getHandler<typeof AuthAction.useCode>>;

  beforeAll(async () => {
    await setUpTestEnvironment();
    handler = module.getHandler(AuthAction.useCode);
  }, 5000);

  afterEach(async () => {
    await db.user.deleteMany({});
    await db.otp.deleteMany({});
  });

  it('should return token for a user', async () => {
    vi.spyOn(hashUtils, 'verifyString').mockResolvedValue(true);

    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);

    const user = await db.user.create({
      data: {
        email: faker.internet.email(),
        otpTokens: {
          create: {
            type: 'AUTH',
            expiresAt: tenMinutesFromNow,
            tokenHash: faker.string.alphanumeric(),
          },
        },
      },
    });

    const { data } = await handler!({
      ...createActionMocks(),
      input: {
        email: user.email,
        otp: '123456',
      },
    });

    expect(data).toMatchObject({
      user: expect.objectContaining({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
      token: expect.any(String),
    });
  });

  it('should throw error if user does not exist', async () => {
    await expect(
      handler!({
        ...createActionMocks(),
        input: {
          email: faker.internet.email(),
          otp: '123456',
        },
      })
    ).rejects.toThrow(
      expect.objectContaining({
        message: 'Invalid credentials',
      })
    );
  });

  it('should throw error if otp token does not exist', async () => {
    const user = await db.user.create({
      data: {
        email: faker.internet.email(),
      },
    });

    await expect(
      handler!({
        ...createActionMocks(),
        input: {
          email: user.email,
          otp: '123456',
        },
      })
    ).rejects.toThrow(
      expect.objectContaining({
        message: 'Invalid credentials',
      })
    );
  });

  it('should throw error for an invalid otp', async () => {
    vi.spyOn(hashUtils, 'verifyString').mockResolvedValue(false);

    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);

    const user = await db.user.create({
      data: {
        email: faker.internet.email(),
        otpTokens: {
          create: {
            type: 'AUTH',
            expiresAt: tenMinutesFromNow,
            tokenHash: faker.string.alphanumeric(),
          },
        },
      },
    });

    await expect(
      handler!({
        ...createActionMocks(),
        input: {
          email: user.email,
          otp: '123456',
        },
      })
    ).rejects.toThrow(
      expect.objectContaining({
        message: 'Invalid credentials',
      })
    );
  });

  it('should throw error for an expired otp', async () => {
    vi.spyOn(hashUtils, 'verifyString').mockResolvedValue(false);

    const now = new Date();

    const user = await db.user.create({
      data: {
        email: faker.internet.email(),
        otpTokens: {
          create: {
            type: 'AUTH',
            expiresAt: now,
            tokenHash: faker.string.alphanumeric(),
          },
        },
      },
    });

    await expect(
      handler!({
        ...createActionMocks(),
        input: {
          email: user.email,
          otp: '123456',
        },
      })
    ).rejects.toThrow(
      expect.objectContaining({
        message: 'Invalid credentials',
      })
    );
  });
});
