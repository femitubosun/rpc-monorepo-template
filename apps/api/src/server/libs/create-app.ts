import { OpenAPIHono } from '@hono/zod-openapi';
import Env from '@template/env';
import { parseError } from '@template/error';
import { cors } from 'hono/cors';
import { showRoutes } from 'hono/dev';
import { secureHeaders } from 'hono/secure-headers';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import type { AppBindings } from '../__defs__';
import { logger } from '../middlewares/logger';

export default function createApp() {
  const app = new OpenAPIHono<AppBindings>({
    strict: false,
  });

  // Debug CORS configuration on startup
  console.log('🔍 CORS Configuration:', {
    allowedHosts: Env.ALLOWED_HOSTS,
  });

  // Debug middleware for OPTIONS requests
  app.use('/api/*', async (c, next) => {
    if (c.req.method === 'OPTIONS') {
      const origin = c.req.header('origin');
      const isAllowed = Array.isArray(Env.ALLOWED_HOSTS)
        ? Env.ALLOWED_HOSTS.includes(origin || '')
        : Env.ALLOWED_HOSTS === origin;

      console.log('🔍 OPTIONS request:', {
        path: c.req.path,
        origin,
        isAllowed,
        allowedHosts: Env.ALLOWED_HOSTS,
      });
    }
    await next();
  });

  app.use(
    '/api/*',
    cors({
      origin: Env.ALLOWED_HOSTS,
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'X-Requested-With',
        'X-Request-ID',
      ],
      credentials: true,
    })
  );

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

    const isAlreadyLogged = (err as any).isLogged;

    if (isAlreadyLogged) {
      // Error already logged at action layer with stack trace
      // Just log HTTP context for correlation
      c.var.logger.warn('Request failed', {
        errorType: error.body.type,
        errorMessage: error.body.message,
        statusCode: error.statusCode,
      });
    } else {
      // Error not logged yet (e.g., middleware error, parsing error)
      // Log the full error here
      if (error.statusCode === 500) {
        c.var.logger.error('🆘 Unknown Error', err);
      } else {
        c.var.logger.error('🚨 Error', err);
      }
    }

    return c.json(error.body, error.statusCode as ContentfulStatusCode);
  });

  return app;
}
