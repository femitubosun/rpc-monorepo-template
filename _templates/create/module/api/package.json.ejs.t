---
to: modules/<%=name%>/api/package.json
---
{
  "name": "@axon-ai/<%=name%>-api",
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
    "check-types": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "3.25.74",
    "@axon-ai/action": "workspace:*",
    "@axon-ai/app-utils": "workspace:*",
    "@axon-ai/app-defs": "workspace:*",
    "@axon-ai/<%=name%>-action-defs": "workspace:*",
    "@axon-ai/<%=name%>-defs": "workspace:*",
    "@axon-ai/<%=name%>-module": "workspace:*",
    "@axon-ai/logging": "workspace:*",
    "@axon-ai/env": "workspace:*",
    "@axon-ai/db": "workspace:*",
    "@axon-ai/error": "workspace:*",
    "@axon-ai/router": "workspace:*",
    "@axon-ai/testing": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "typescript": "5.8.2"
    
  }
}
