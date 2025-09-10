import { scheduleAction } from '@template/action';
import AuthAction from '@template/auth-action-defs';
import module from '@template/auth-module';
import db from '@template/db';
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from '@template/testing';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

vi.mock('@template/action', async () => {
  const actual = await vi.importActual('@template/action');
  return {
    ...actual,
    scheduleAction: vi.fn(),
  };
});

const mockScheduleAction = vi.mocked(scheduleAction);

describe('Auth.signup Test', () => {
  let handler: ReturnType<typeof module.getHandler<typeof AuthAction.signup>>;

  beforeAll(async () => {
    await setUpTestEnvironment();

    handler = module.getHandler(AuthAction.signup);
  }, 3000);

  beforeEach(() => {
    mockScheduleAction.mockClear();
  });

  afterEach(async () => {
    await db.otp.deleteMany({});
    await db.user.deleteMany({});
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should signup a user successfully', async () => {
    const email = faker.internet.email();

    const result = await handler!({
      ...createActionMocks(),
      input: {
        email,
      },
    });

    const user = await db.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    expect(user).toBeTruthy();
    expect(result).toMatchObject({
      data: {
        message: 'Signup successful',
      },
    });
  });

  describe.each([
    {
      name: 'OTP token',
      table: 'otp',
      countMethod: () => db.otp.count(),
    },
  ])('should create $name for a new user', ({ name, countMethod }) => {
    it(`should create ${name}`, async () => {
      const initialCount = await countMethod();
      const email = faker.internet.email();

      await handler!({
        ...createActionMocks(),
        input: {
          email,
        },
      });

      expect(initialCount + 1).toEqual(await countMethod());
    });
  });

  it('should create an otpToken that expires in the in the future ', async () => {
    const email = faker.internet.email();

    await handler!({
      ...createActionMocks(),
      input: {
        email,
      },
    });

    const otp = await db.otp.findFirst({
      where: {
        user: {
          email,
        },
      },
      select: {
        id: true,
        expiresAt: true,
      },
    });

    expect(otp?.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it('should schedule both email actions', async () => {
    const email = faker.internet.email();

    await handler!({
      ...createActionMocks(),
      input: { email },
    });

    expect(mockScheduleAction).toHaveBeenCalledTimes(2);
  });

  it('should throw CONFLICT if user already exists', async () => {
    const email = faker.internet.email();
    await db.user.create({
      data: {
        email,
      },
    });

    await expect(
      handler!({
        ...createActionMocks(),
        context: {},
        input: {
          email,
        },
      })
    ).rejects.toThrowError(
      expect.objectContaining({
        message: 'User already exists',
        type: 'CONFLICT',
        data: {
          email,
        },
      })
    );
  });

  describe.each([
    {
      name: 'sendOnboardingMail',
      action: AuthAction.mail.sendOnboardingMail,
    },
    {
      name: 'sendSignInCode',
      action: AuthAction.mail.sendSignInCode,
    },
  ])('should schedule $name action', ({ name, action }) => {
    it(`should schedule ${name}`, async () => {
      const email = faker.internet.email();

      await handler!({
        ...createActionMocks(),
        input: { email },
      });

      const expectedInput =
        name === 'sendOnboardingMail'
          ? {
              email,
              name: email.split('@')[0],
            }
          : {
              email,
              name: email.split('@')[0],
              otp: expect.stringMatching(/^\d{6}$/),
            };

      expect(mockScheduleAction).toHaveBeenCalledWith(
        action,
        expect.objectContaining({
          input: expectedInput,
        })
      );
    });
  });
});
