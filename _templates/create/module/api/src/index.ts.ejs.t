---
to: modules/<%=name%>/api/src/index.ts
---
import { type AppOpenAPI, CreateAppRouter, Module } from '@template/router';
import { _handlers } from './handlers';
import { _router } from './router';

export function router(): AppOpenAPI {
  const router = CreateAppRouter();

  Module.registerRoutes(router, _router, _handlers);

  return router;
}

const moduleRouter: AppOpenAPI = router();
export default moduleRouter;
