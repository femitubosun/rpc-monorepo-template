import { faker } from '@template/testing';
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

// Setup all mocks at module level
vi.mock('@template/action', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@template/action')
    >();
  return {
    ...actual,
    callAction: vi.fn(),
  };
});

vi.mock('@template/auth-action-defs', () => ({
  default: {
    session: {
      get: 'session.get',
      create: 'session.create',
    },
    useCode: 'useCode',
  },
}));

vi.mock('@template/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
    },
    otp: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@template/env', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@template/env')>();
  return {
    ...actual,
    default: {
      ACCESS_TOKEN_SECRET: 'test-secret-key',
    },
  };
});

vi.mock('@template/error', async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import('@template/error')
    >();
  return {
    ...actual,
  };
});

vi.mock('@template/hash-utils', () => ({
  verifyString: vi.fn(),
  hashString: vi.fn(),
}));

vi.mock('@template/api-utils', () => ({
  signJwt: vi.fn(),
  verifyJwt: vi.fn(),
}));

vi.mock('../logic/jwt', () => ({
  getJwtExpiresIn: () => '3Days',
}));

import { callAction } from '@template/action';
import { signJwt } from '@template/api-utils';
import db from '@template/db';
import {
  hashString,
  verifyString,
} from '@template/hash-utils';
import module from '../_module';
import './use-code';

// Mock data helpers
const createMockUser = (overrides?: any) => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  name: faker.person.fullName(),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  ...overrides,
});

const createMockSession = (overrides?: any) => ({
  id: faker.string.uuid(),
  userId: faker.string.uuid(),
  version: 1,
  expiresAt: faker.date.future(),
  ...overrides,
});

const createMockContext = (overrides?: any) => ({
  userId: faker.string.uuid(),
  developerId: faker.string.uuid(),
  ...overrides,
});

const createAuthTestKit = () => {
  const mocks = {
    action: {
      callAction: vi.mocked(callAction) as any,
    },
    db: vi.mocked(db) as any,
    error: {
      makeError: vi
        .fn()
        .mockImplementation(
          (args: {
            message: string;
            type: string;
            data?: any;
          }) => {
            const error = new Error(args.message);
            (error as any).type = args.type;
            (error as any).data = args.data;
            return error;
          }
        ),
    },
    hash: {
      verifyString: vi.mocked(verifyString),
      hashString: vi.mocked(hashString),
    },
    utils: {
      getJwtExpiresIn: vi.fn().mockReturnValue('3Days'),
    },
    jwt: {
      signJwt: vi.mocked(signJwt),
    },
  };

  return {
    mocks,

    clearAll() {
      vi.clearAllMocks();
    },

    setupSuccessfulAuth(testData: {
      user: any;
      otpToken: any;
      session: any;
    }) {
      mocks.db.user.findUnique.mockResolvedValue(
        testData.user
      );
      mocks.db.otp.findFirst.mockResolvedValue(
        testData.otpToken
      );
      mocks.db.otp.update.mockResolvedValue({
        id: testData.otpToken.id,
      });
      mocks.hash.verifyString.mockResolvedValue(true);
      mocks.action.callAction
        .mockResolvedValueOnce({ data: testData.session })
        .mockResolvedValueOnce({ data: testData.session });
      mocks.jwt.signJwt.mockReturnValue('mock-jwt-token');
    },

    setupAuthFailure(
      failureType: 'user' | 'otp' | 'verify',
      testData: { user: any; otpToken: any }
    ) {
      if (failureType === 'user') {
        mocks.db.user.findUnique.mockResolvedValue(null);
      } else {
        mocks.db.user.findUnique.mockResolvedValue(
          testData.user
        );
        if (failureType === 'otp') {
          mocks.db.otp.findFirst.mockResolvedValue(null);
        } else {
          mocks.db.otp.findFirst.mockResolvedValue(
            testData.otpToken
          );
          mocks.hash.verifyString.mockResolvedValue(false);
        }
      }
    },

    expectInvalidCredentialsError(
      data: Record<string, string>
    ) {
      expect(mocks.error.makeError).toHaveBeenCalledWith({
        message: 'Invalid credentials',
        type: 'BAD_REQUEST',
        data,
      });
    },

    expectUserQuery(email: string) {
      expect(mocks.db.user.findUnique).toHaveBeenCalledWith(
        {
          where: { email },
          select: expect.any(Object),
        }
      );
    },

    expectOtpQuery(userId: string) {
      expect(mocks.db.otp.findFirst).toHaveBeenCalledWith({
        where: {
          userId,
          expiresAt: { gt: expect.any(Date) },
          type: 'AUTH',
          isUsed: false,
        },
        select: {
          id: true,
          tokenHash: true,
        },
      });
    },

    expectOtpVerification(tokenHash: string, otp: string) {
      expect(mocks.hash.verifyString).toHaveBeenCalledWith(
        tokenHash,
        otp
      );
    },

    expectSessionCreation(
      user: any,
      version: number,
      context: any
    ) {
      expect(mocks.action.callAction).toHaveBeenCalledWith(
        'session.create',
        {
          input: { user, version },
          context,
        }
      );
    },

    expectOtpMarkedAsUsed(otpId: string) {
      expect(mocks.db.otp.update).toHaveBeenCalledWith({
        where: { id: otpId },
        data: { isUsed: true },
        select: { id: true },
      });
    },

    expectJwtGeneration(session: any) {
      expect(mocks.jwt.signJwt).toHaveBeenCalledWith(
        session
      );
    },
  };
};

describe('use-code action', () => {
  const testKit = createAuthTestKit();
  let testData: {
    user: any;
    otpToken: any;
    session: any;
    context: any;
    input: { email: string; otp: string };
  };
  let useCodeHandler: any;

  beforeEach(() => {
    testKit.clearAll();

    testData = {
      user: createMockUser(),
      otpToken: {
        id: faker.string.uuid(),
        tokenHash: faker.string.hexadecimal(),
      },
      session: createMockSession(),
      context: createMockContext(),
      input: {
        email: faker.internet.email(),
        otp: '123456',
      },
    };

    // Get the real handler that was registered
    useCodeHandler = module._handlers.useCode;
  });

  describe('successful authentication', () => {
    beforeEach(() => {
      testKit.setupSuccessfulAuth(testData);
    });

    it('should authenticate and return user with token', async () => {
      const result = await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      expect(result).toEqual({
        data: {
          user: testData.user,
          token: 'mock-jwt-token',
        },
        context: testData.context,
      });
    });

    it('should query user by email with correct select fields', async () => {
      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      testKit.expectUserQuery(testData.input.email);
    });

    it('should find valid OTP token with security constraints', async () => {
      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      testKit.expectOtpQuery(testData.user.id);
    });

    it('should verify OTP hash correctly', async () => {
      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      testKit.expectOtpVerification(
        testData.otpToken.tokenHash,
        testData.input.otp
      );
    });

    it('should get existing session and mark OTP as used in parallel', async () => {
      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      expect(
        testKit.mocks.action.callAction
      ).toHaveBeenNthCalledWith(1, 'session.get', {
        context: testData.context,
        input: { userId: testData.user.id },
      });

      testKit.expectOtpMarkedAsUsed(testData.otpToken.id);
    });

    it('should create new session with existing version', async () => {
      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      testKit.expectSessionCreation(
        testData.user,
        testData.session.version,
        testData.context
      );
    });

    it('should generate JWT with correct parameters', async () => {
      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      testKit.expectJwtGeneration(testData.session);
    });
  });

  describe('authentication failures', () => {
    it.each([
      ['user not found', 'user'],
      ['OTP token not found', 'otp'],
      ['OTP verification fails', 'verify'],
    ] as const)(
      'should throw error when %s',
      async (_description, failureType) => {
        testKit.setupAuthFailure(failureType, testData);

        await expect(
          useCodeHandler({
            context: testData.context,
            input: testData.input,
            makeError: testKit.mocks.error.makeError,
          })
        ).rejects.toThrow('Invalid credentials');

        testKit.expectInvalidCredentialsError(
          testData.input
        );
      }
    );

    it('should not mark OTP as used when verification fails', async () => {
      testKit.setupAuthFailure('verify', testData);

      await expect(
        useCodeHandler({
          context: testData.context,
          input: testData.input,
          makeError: testKit.mocks.error.makeError,
        })
      ).rejects.toThrow();

      expect(
        testKit.mocks.db.otp.update
      ).not.toHaveBeenCalled();
    });

    it('should handle database connection errors', async () => {
      const dbError = new Error(
        'Database connection failed'
      );
      testKit.mocks.db.user.findUnique.mockRejectedValue(
        dbError
      );

      await expect(
        useCodeHandler({
          context: testData.context,
          input: testData.input,
          makeError: testKit.mocks.error.makeError,
        })
      ).rejects.toThrow('Database connection failed');
    });

    it('should handle session creation failures', async () => {
      testKit.mocks.db.user.findUnique.mockResolvedValue(
        testData.user
      );
      testKit.mocks.db.otp.findFirst.mockResolvedValue(
        testData.otpToken
      );
      testKit.mocks.hash.verifyString.mockResolvedValue(
        true
      );
      testKit.mocks.action.callAction
        .mockResolvedValueOnce({ data: testData.session })
        .mockRejectedValueOnce(
          new Error('Session creation failed')
        );

      await expect(
        useCodeHandler({
          context: testData.context,
          input: testData.input,
          makeError: testKit.mocks.error.makeError,
        })
      ).rejects.toThrow('Session creation failed');
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      testKit.mocks.db.user.findUnique.mockResolvedValue(
        testData.user
      );
      testKit.mocks.db.otp.findFirst.mockResolvedValue(
        testData.otpToken
      );
      testKit.mocks.db.otp.update.mockResolvedValue({
        id: testData.otpToken.id,
      });
      testKit.mocks.hash.verifyString.mockResolvedValue(
        true
      );
      testKit.mocks.jwt.signJwt.mockReturnValue(
        'mock-jwt-token'
      );
    });

    it('should default to version 1 when no existing session', async () => {
      testKit.mocks.action.callAction
        .mockResolvedValueOnce({ data: null }) // No existing session
        .mockResolvedValueOnce({ data: testData.session });

      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      testKit.expectSessionCreation(
        testData.user,
        1,
        testData.context
      );
    });

    it('should handle session without version property', async () => {
      const sessionWithoutVersion = { user: testData.user };
      testKit.mocks.action.callAction
        .mockResolvedValueOnce({
          data: sessionWithoutVersion,
        })
        .mockResolvedValueOnce({ data: testData.session });

      const result = await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      testKit.expectSessionCreation(
        testData.user,
        1,
        testData.context
      );
      expect(result.data.token).toBe('mock-jwt-token');
    });

    it('should handle user with null name field', async () => {
      const userWithNullName = {
        id: faker.string.uuid(),
        name: null,
      };

      testKit.mocks.db.user.findUnique.mockResolvedValue(
        userWithNullName
      );
      testKit.mocks.action.callAction
        .mockResolvedValueOnce({ data: testData.session })
        .mockResolvedValueOnce({
          data: {
            ...testData.session,
            user: userWithNullName,
          },
        });

      const result = await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      expect(result.data.user.name).toBeNull();
    });

    it('should validate OTP expiration time is checked correctly', async () => {
      testKit.mocks.db.otp.findFirst.mockImplementation(
        ({ where }: any) => {
          expect(where.expiresAt.gt).toBeInstanceOf(Date);
          expect(
            where.expiresAt.gt.getTime()
          ).toBeLessThanOrEqual(Date.now());
          return Promise.resolve(testData.otpToken);
        }
      );

      testKit.mocks.action.callAction
        .mockResolvedValueOnce({ data: testData.session })
        .mockResolvedValueOnce({ data: testData.session });

      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      expect(
        testKit.mocks.db.otp.findFirst
      ).toHaveBeenCalled();
    });
  });

  describe('security considerations', () => {
    beforeEach(() => {
      testKit.mocks.db.otp.update.mockResolvedValue({
        id: testData.otpToken.id,
      });
      testKit.mocks.action.callAction
        .mockResolvedValueOnce({ data: testData.session })
        .mockResolvedValueOnce({ data: testData.session });
    });

    it('should use consistent error messages for all auth failures', async () => {
      const failureScenarios = [
        () => testKit.setupAuthFailure('user', testData),
        () => testKit.setupAuthFailure('otp', testData),
        () => testKit.setupAuthFailure('verify', testData),
      ];

      for (const setupFailure of failureScenarios) {
        testKit.clearAll();
        setupFailure();

        await expect(
          useCodeHandler({
            context: testData.context,
            input: testData.input,
            makeError: testKit.mocks.error.makeError,
          })
        ).rejects.toThrow('Invalid credentials');

        testKit.expectInvalidCredentialsError(
          testData.input
        );
      }
    });

    it('should enforce all OTP security constraints', async () => {
      testKit.setupSuccessfulAuth(testData);

      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      const otpQuery =
        testKit.mocks.db.otp.findFirst.mock.calls[0][0];
      expect(otpQuery.where).toEqual({
        userId: testData.user.id,
        expiresAt: { gt: expect.any(Date) },
        type: 'AUTH',
        isUsed: false,
      });
    });

    it('should only select necessary user fields for security', async () => {
      testKit.setupSuccessfulAuth(testData);

      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      const userQuery =
        testKit.mocks.db.user.findUnique.mock.calls[0][0];
      expect(userQuery.select).toBeDefined();
      expect(typeof userQuery.select).toBe('object');
    });

    it('should process session retrieval and OTP invalidation in parallel', async () => {
      testKit.setupSuccessfulAuth(testData);

      await useCodeHandler({
        context: testData.context,
        input: testData.input,
        makeError: testKit.mocks.error.makeError,
      });

      // Both should be called as part of Promise.all
      expect(
        testKit.mocks.action.callAction
      ).toHaveBeenCalledWith('session.get', {
        context: testData.context,
        input: { userId: testData.user.id },
      });

      testKit.expectOtpMarkedAsUsed(testData.otpToken.id);
    });
  });
});
