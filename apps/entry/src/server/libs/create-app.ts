import { OpenAPIHono } from '@hono/zod-openapi';
import Env from '@template/env';
import { AppError } from '@template/error';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppBindings } from '../__defs__';
import { logger } from '../middlewares/logger';

export default function createApp() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
  });

  app.use(logger());

  app.notFound((c) => {
    return c.text('Not Found', 404);
  });

  app.onError((err, c) => {
    const isProd = Env.NODE_ENV === 'production';

    if (err instanceof AppError) {
      c.var.logger.error('App Error', err);

      if (err.type === 'INTERNAL') {
        return c.json(getInternalErrorMessage(err), 500);
      }

      return c.json(
        isProd ? err.toProdJSON() : err.toJSON(),
        (err.code ?? 500) as ContentfulStatusCode
      );
    }

    c.var.logger.error('🆘 Unknown Error', err);

    return c.json(
      {
        message: err.message,
        ...(isProd ? {} : { stack: err.stack }),
      },
      500
    );
  });

  return app;
}

function getInternalErrorMessage(err: AppError) {
  return Env.NODE_ENV === 'production'
    ? {
        message: 'Something went wrong',
      }
    : {
        message: err.message,
        stack: err.stack,
        data: err.toJSON(),
      };
}
