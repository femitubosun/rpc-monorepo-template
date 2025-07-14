import { CreateAppRouter, Module } from '@template/router';
import { _handlers } from './handlers';
import { _router } from './router';

export function router() {
  const router = CreateAppRouter();

  Module.registerRoutes(router, _router, _handlers);

  return router;
}

const moduleRouter = router();
export default moduleRouter;
