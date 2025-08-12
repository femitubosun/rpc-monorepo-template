---
to: modules/<%=name%>/api/src/handlers/index.ts
---
import type { ModuleRouterHandler } from '@axon-ai/router';
import type router from '../router';

export const _handlers: ModuleRouterHandler<typeof router> = {

};
