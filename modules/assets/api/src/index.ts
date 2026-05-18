import { type AppOpenAPI, CreateAppRouter, Module } from '@template/router';
import { createSSEHandler } from '@template/sse';
import { _handlers } from './handlers';
import { _router } from './router';

export function router(): AppOpenAPI {
  const router = CreateAppRouter();

  Module.registerRoutes(router, _router, _handlers);

  // SSE endpoint for real-time asset updates
  router.get('/assets/events', createSSEHandler({
    tags: ['assets'],
    onConnect: (clientId) => {
      console.log(`Client ${clientId} subscribed to asset events`);
    },
    onDisconnect: (clientId) => {
      console.log(`Client ${clientId} disconnected from asset events`);
    },
  }));

  return router;
}

const moduleRouter: AppOpenAPI = router();
export default moduleRouter;
