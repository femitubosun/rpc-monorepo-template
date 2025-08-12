import AuthAction from "@template/auth-action-defs";
import module from "@template/auth-module";
import cache from "@template/cache";
import {
  createActionMocks,
  faker,
  setUpTestEnvironment,
} from "@template/testing";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

describe("auth.session.refresh Test", async () => {
  let handler: ReturnType<
    typeof module.getHandler<typeof AuthAction.session.refresh>
  >;
  const user = {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    developerProfile: {
      id: faker.string.uuid(),
    },
  };

  beforeAll(async () => {
    await setUpTestEnvironment();
    handler = module.getHandler(AuthAction.session.refresh);
  });

  afterEach(async () => {
    await cache.delete(`session:${user.id}`);
  });

  it("should throw NOT_FOUND error when session does not exist", async () => {
    await expect(
      handler!({
        ...createActionMocks(),
        input: user,
      }),
    ).rejects.toThrow();
  });

  it("should refresh session and increment version", async () => {
    const initialSession = {
      user,
      version: 1,
    };

    await cache.set(`session:${user.id}`, initialSession);

    const result = await handler!({
      ...createActionMocks(),
      input: user,
    });

    expect(result).toMatchObject({
      data: {
        user,
        version: 2,
      },
    });
  });

  it("should update session in cache with new version", async () => {
    const initialSession = {
      user,
      version: 3,
    };

    await cache.set(`session:${user.id}`, initialSession);

    await handler!({
      ...createActionMocks(),
      input: user,
    });

    const cachedSession = await cache.get(`session:${user.id}`);
    expect(cachedSession).toMatchObject({
      user,
      version: 4,
    });
  });

  it("should work with multiple refresh calls", async () => {
    const initialSession = {
      user,
      version: 1,
    };

    await cache.set(`session:${user.id}`, initialSession);

    const result1 = await handler!({
      ...createActionMocks(),
      input: user,
    });

    expect(result1.data.version).toBe(2);

    const result2 = await handler!({
      ...createActionMocks(),
      input: user,
    });

    expect(result2.data.version).toBe(3);

    const cachedSession: any = await cache.get(`session:${user.id}`);
    expect(cachedSession?.version).toBe(3);
  });
});
