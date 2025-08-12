import AuthAction from "@template/auth-action-defs";
import module from "@template/auth-module";
import cache from "@template/cache";
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from "@template/testing";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

describe("auth.session.invalidate Test", async () => {
  let handler: ReturnType<
    typeof module.getHandler<typeof AuthAction.session.invalidate>
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
    handler = module.getHandler(AuthAction.session.invalidate);
  });

  afterEach(async () => {
    await cache.delete(`session:${userId}`);
  });

  it("should return null", async () => {
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

  it("should delete session from cache", async () => {
    const sessionData = {
      user,
      version: 1,
    };

    await cache.set(`session:${userId}`, sessionData);

    const cachedSessionBefore = await cache.get(`session:${userId}`);
    expect(cachedSessionBefore).toMatchObject(sessionData);

    await handler!({
      ...createActionMocks(),
      input: {
        userId,
      },
    });

    const cachedSessionAfter = await cache.get(`session:${userId}`);
    expect(cachedSessionAfter).toBeNull();
  });

  it("should work even when session does not exist", async () => {
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
});
