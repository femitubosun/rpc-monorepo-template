---
to: modules/<%=name%>/__testing__/package.json
---
{
  "name": "@template/<%=name%>-testing",
  "type": "module",
  "version": "0.0.0",
  "scripts": {
    "test": "NX_LOAD_DOT_ENV_FILES=false dotenvx run --env-file=../../../.env.test -- vitest run"
  },
  "devDependencies": {
    "@template/action": "workspace:*",
    "@template/api-utils": "workspace:*",
    "@template/<%=name%>-action-defs": "workspace:*",
    "@template/<%=name%>-defs": "workspace:*",
    "@template/<%=name%>-module": "workspace:*",
    "@template/env": "workspace:*",
    "@template/logging": "workspace:*",
    "@template/testing": "workspace:*",
    "@types/node": "^22.15.3",
    "typescript": "5.8.2",
    "vite-tsconfig-paths": "^5.1.4",
    "vitest": "^3.2.4",
    "zod": "3.25.74"
  }
}
