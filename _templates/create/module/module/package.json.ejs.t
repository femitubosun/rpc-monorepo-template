---
to: modules/<%=name%>/module/package.json
---
{
  "name": "@template/<%=name%>-module",
  "type": "module",
  "version": "0.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",

  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc && tsc-alias",
    "dev": "tsc --watch",
    "check-types": "tsc --noEmit --incremental"
  },
  "dependencies": {
    "zod": "3.25.74",
    "@template/prisma-defs": "workspace:*",
    "@template/app-defs": "workspace:*",
    "@template/logging": "workspace:*",
    "@template/env": "workspace:*",
    "@template/action": "workspace:*",
    "@template/<%=name%>-defs": "workspace:*",
    "@template/<%=name%>-action-defs": "workspace:*",
    "@template/db": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "typescript": "5.8.2",
    "tsc-alias": "^1.8.16"
  }
}
