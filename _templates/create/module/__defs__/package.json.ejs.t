---
to: modules/<%=name%>/__defs__/package.json
---
{
  "name": "@template/<%=name%>-defs",
  "version": "0.0.0",
  "main": "dist/index.js",
  "module": "dist/index.js",
  "type": "module",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "test:watch": "jest --watch",
    "check-types": "tsc --noEmit",
    "lint": "eslint src --max-warnings 0"
  },
  "dependencies": {
    "zod": "3.25.74",
    "@template/prisma-defs": "workspace:*",
    "@template/logging": "workspace:*",
    "@template/env": "workspace:*"
  },
  "devDependencies": {
   "@types/node": "^22.15.3",
   "eslint": "^9.30.0",
   "typescript": "5.8.2"
  }
}
