---
to: modules/<%=name%>/__defs__/package.json
---
{
  "name": "@template/<%=name%>-defs",
  "type": "module",
  "version": "0.0.0",
  "main": "src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit --incremental"
  },
  "dependencies": {
    "zod": "4.4.3",
    "@template/prisma-defs": "workspace:*",
    "@template/logging": "workspace:*",
    "@template/env": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "typescript": "5.8.2"
  }
}
