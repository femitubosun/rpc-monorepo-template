import {
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

vi.mock('@template/mail', () => ({
  default: {
    sendWelcomeMail: vi.fn().mockResolvedValue(undefined),
  },
}));

import AuthAction from '@template/auth-action-defs';
import module from '@template/auth-module';
import mail from '@template/mail';
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from '@template/testing';

const mockMail = vi.mocked(mail);

describe('Auth.mail.sendOnboardingMail Test', () => {
  let handler: ReturnType<
    typeof module.getHandler<
      typeof AuthAction.mail.sendOnboardingMail
    >
  >;

  beforeAll(async () => {
    await setUpTestEnvironment();

    handler = module.getHandler(
      AuthAction.mail.sendOnboardingMail
    );
  }, 3000);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should call mail.sendWelcomeMail with correct parameters', async () => {
    const email = faker.internet.email();
    const name = faker.person.firstName();
    const context = { userId: faker.string.uuid() };

    const result = await handler!({
      ...createActionMocks(),
      input: {
        email,
        name,
      },
      context,
    });

    expect(result).toEqual({
      context,
      data: null,
    });

    expect(mockMail.sendWelcomeMail).toHaveBeenCalledWith(
      email,
      name
    );
  });

  it('should return correct response structure', async () => {
    const email = faker.internet.email();
    const name = faker.person.firstName();
    const context = { userId: faker.string.uuid() };

    const result = await handler!({
      ...createActionMocks(),
      input: {
        email,
        name,
      },
      context,
    });

    expect(result).toEqual({
      context,
      data: null,
    });
  });

  it('should handle mail service errors gracefully', async () => {
    const email = faker.internet.email();
    const name = faker.person.firstName();
    const context = { userId: faker.string.uuid() };

    mockMail.sendWelcomeMail.mockRejectedValueOnce(
      new Error('Mail service error')
    );

    const result = await handler!({
      ...createActionMocks(),
      input: {
        email,
        name,
      },
      context,
    });

    expect(result).toEqual({
      context,
      data: null,
    });
  });
});
