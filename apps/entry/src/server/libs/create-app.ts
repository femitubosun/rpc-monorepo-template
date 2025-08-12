import { OpenAPIHono } from '@hono/zod-openapi';
import { parseError } from '@template/error';
import { showRoutes } from 'hono/dev';
import { secureHeaders } from 'hono/secure-headers';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppBindings } from '../__defs__';
import { logger } from '../middlewares/logger';

export default function createApp() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
  });

  showRoutes(app, {
    verbose: true,
  });

  app.use(logger());
  app.use(secureHeaders());

  app.notFound((c) => {
    return c.text('Not Found', 404);
  });

  app.onError((err, c) => {
    const error = parseError(err);

    if (error.statusCode === 500) {
      c.var.logger.error('🆘 Unknown Error', err);
    } else {
      c.var.logger.error('🚨 Error', err);
    }

    return c.json(
      error.body,
      error.statusCode as ContentfulStatusCode
    );
  });

  return app;
}
