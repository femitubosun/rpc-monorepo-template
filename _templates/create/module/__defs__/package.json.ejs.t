---
to: modules/<%=name%>/__defs__/package.json
---
{
  "name": "@template/<%=name%>-defs",
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
    "@template/prisma-defs": "workspace:*",
    "@template/logging": "workspace:*",
    "@template/env": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "typescript": "5.8.2"
  }
}
