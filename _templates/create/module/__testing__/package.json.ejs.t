---
to: modules/<%=name%>/__testing__/package.json
---
{
  "name": "@axon-ai/<%=name%>-testing",
  "type": "module",
  "version": "0.0.0",
  "scripts": {
    "test": "NX_LOAD_DOT_ENV_FILES=false dotenvx run --env-file=../../../.env.test -- vitest run"
  },
  "devDependencies": {
    "@axon-ai/action": "workspace:*",
    "@axon-ai/api-utils": "workspace:*",
    "@axon-ai/<%=name%>-action-defs": "workspace:*",
    "@axon-ai/<%=name%>-defs": "workspace:*",
    "@axon-ai/<%=name%>-module": "workspace:*",
    "@axon-ai/env": "workspace:*",
    "@axon-ai/logging": "workspace:*",
    "@axon-ai/testing": "workspace:*",
    "@types/node": "^22.15.3",
    "typescript": "5.8.2",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^3.2.4",
    "zod": "3.25.74"
  }
}
