---
to: modules/<%=name%>/api/package.json
---
{
  "name": "@template/<%=name%>-api",
  "type": "module",
  "version": "0.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",

  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "check-types": "tsc --noEmit --incremental"
  },
  "dependencies": {
    "zod": "3.25.74",
    "@template/action": "workspace:*",
    "@template/app-utils": "workspace:*",
    "@template/app-defs": "workspace:*",
    "@template/<%=name%>-action-defs": "workspace:*",
    "@template/<%=name%>-defs": "workspace:*",
    "@template/<%=name%>-module": "workspace:*",
    "@template/logging": "workspace:*",
    "@template/env": "workspace:*",
    "@template/db": "workspace:*",
    "@template/error": "workspace:*",
    "@template/router": "workspace:*",
    "@template/testing": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "typescript": "5.8.2"

  }
}
