import { Scalar } from '@scalar/hono-api-reference';
import type { AppOpenAPI } from '../__defs__';

export function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/docs', {
    openapi: '3.0.0',
    info: {
      title: 'your Project API',
      version: '0.0.0',
    },
  });

  app.get(
    '/docs/ref',
    Scalar({
      url: '/docs',
      theme: 'deepSpace',
      layout: 'modern',
    })
  );
}
