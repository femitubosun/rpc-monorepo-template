import { scheduleAction } from "@template/action";
import AuthAction from "@template/auth-action-defs";
import module from "@template/auth-module";
import db from "@template/db";
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from "@template/testing";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";

vi.mock("@template/action", async () => {
  const actual = await vi.importActual("@template/action");
  return {
    ...actual,
    scheduleAction: vi.fn(),
  };
});

const mockScheduleAction = vi.mocked(scheduleAction);

describe("Auth.signin Test", () => {
  let handler: ReturnType<typeof module.getHandler<typeof AuthAction.signIn>>;

  beforeAll(async () => {
    await setUpTestEnvironment();
    handler = module.getHandler(AuthAction.signIn);
  });

  let email: string;

  beforeEach(() => {
    email = faker.internet.email();
    mockScheduleAction.mockClear();
  });

  afterEach(async () => {
    await db.otp.deleteMany({});
    await db.developerProfile.deleteMany({});
    await db.user.deleteMany({});
  });

  it("should be defined", () => {
    expect(handler).toBeDefined();
  });

  it("should sign in a user successfully", async () => {
    await db.user.create({
      data: {
        email,
        developerProfile: {
          create: {},
        },
      },
    });

    const result = await handler!({
      ...createActionMocks(),
      input: {
        email,
      },
    });

    expect(result).toMatchObject({
      data: {
        message: "Check email for further instructions",
      },
    });
  });

  it("should set all old user AUTH otps to used", async () => {
    const user = await db.user.create({
      data: {
        email,
        developerProfile: {
          create: {},
        },
        otpTokens: {
          create: [
            {
              tokenHash: faker.string.hexadecimal(),
              type: "AUTH",
              expiresAt: new Date(),
            },
            {
              tokenHash: faker.string.hexadecimal(),
              type: "AUTH",
              expiresAt: new Date(),
            },
            {
              tokenHash: faker.string.hexadecimal(),
              type: "AUTH",
              expiresAt: new Date(),
            },
          ],
        },
      },
    });

    await handler!({
      ...createActionMocks(),
      input: {
        email,
      },
    });

    expect(
      await db.otp.count({
        where: {
          user: {
            id: user.id,
          },
          type: "AUTH",
          isUsed: true,
        },
      }),
    ).toBe(3);

    expect(
      await db.otp.count({
        where: {
          user: {
            email,
          },
          type: "AUTH",
          isUsed: false,
        },
      }),
    ).toBe(1);
  });

  it("should schedule signInCodeMail", async () => {
    await db.user.create({
      data: {
        email,
        developerProfile: {
          create: {},
        },
      },
    });

    await handler!({
      ...createActionMocks(),
      input: {
        email,
      },
    });

    expect(mockScheduleAction).toHaveBeenCalledWith(
      AuthAction.mail.sendSignInCode,
      expect.objectContaining({
        input: {
          email,
          name: email.split("@")[0],
          otp: expect.stringMatching(/^\d{6}$/),
        },
      }),
    );
  });
});
