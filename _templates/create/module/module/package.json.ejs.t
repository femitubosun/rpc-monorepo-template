---
to: modules/<%=name%>/module/package.json
---
{
  "name": "@axon-ai/<%=name%>-module",
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
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "3.25.74",
    "@axon-ai/prisma-defs": "workspace:*",
    "@axon-ai/app-defs": "workspace:*",
    "@axon-ai/logging": "workspace:*",
    "@axon-ai/env": "workspace:*",
    "@axon-ai/action": "workspace:*",
    "@axon-ai/<%=name%>-defs": "workspace:*",
    "@axon-ai/<%=name%>-action-defs": "workspace:*",
    "@axon-ai/db": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "typescript": "5.8.2",
    "tsc-alias": "^1.8.16"
  }
}
