---
to: packages/internal/<%= name %>/package.json
---
{
  "name": "@axon-ai/<%= name %>",
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
    "@axon-ai/env": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "eslint": "^9.30.0",
    "typescript": "5.8.2"
  }
}
