import { Scalar } from '@scalar/hono-api-reference';
import type { AppOpenAPI } from '../__defs__';

export function configureOpenAPI(app: AppOpenAPI) {
  app.doc('/docs', {
    openapi: '3.0.0',
    info: {
      title: 'Axon AI API',
      version: '0.0.0',
    },
  });

  app.get(
    '/docs/ref',
    Scalar({
      url: '/docs',
      theme: 'alternate',
      layout: 'modern',
      persistAuth: true,
      authentication: {
        preferredSecurityScheme: 'httpBearer',
        securitySchemes: {
          httpBearer: {
            token: 'xyz token value',
          },
        },
      },
    })
  );
}
