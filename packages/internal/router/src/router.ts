import { type Hook, OpenAPIHono } from '@hono/zod-openapi';
import type { AppBindings } from './__defs__';

// eslint-disable-line
const defaultHook: Hook<any, any, any, any> = (res, c) => {
  if (!res.success) {
    return c.json(
      {
        success: res.success,
        error: res.error,
      },
      422
    );
  }
};

export function CreateAppRouter() {
  return new OpenAPIHono<AppBindings>({
    strict: false,
    defaultHook,
  });
}
