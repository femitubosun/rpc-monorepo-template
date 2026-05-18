---
to: infrastructure/<%= name %>/package.json
---
{
  "name": "@template/<%= name %>",
  "type": "module",
  "version": "0.0.0",
  "main": "src/index.ts",
  "scripts": {
    "check-types": "tsc --noEmit --incremental"
  },
  "dependencies": {
    "zod": "4.4.3",
    "@template/env": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^22.15.3",
    "typescript": "5.8.2"
  }
}
