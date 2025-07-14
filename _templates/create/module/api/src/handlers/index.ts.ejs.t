---
to: modules/<%=name%>/api/src/handlers/index.ts
---
import type { ModuleRouterHandler } from '@template/router';
import type router from '../router';

export const _handlers: ModuleRouterHandler<typeof router> = {

};
