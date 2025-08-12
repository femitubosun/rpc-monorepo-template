import { serve } from '@hono/node-server';
import Env from '@template/env';
import { showRoutes } from 'hono/dev';
import { logger } from '../logger';
import { autoLoadModules } from './libs/auto-load-modules';
import { configureOpenAPI } from './libs/configure-open-api';
import createApp from './libs/create-app';

export async function main() {
  const app = createApp();

  const routes = await autoLoadModules();

  routes.forEach((route) => {
    app.route('/api/v1/', route);
  });

  showRoutes(app, {
    verbose: true,
  });

  configureOpenAPI(app);

  serve(
    {
      fetch: app.fetch,
      port: Env.PORT,
    },
    (info) => {
      logger.info(`Server is started at :${info.port}`);
    }
  );
}
