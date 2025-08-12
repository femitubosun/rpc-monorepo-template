---
to: packages/internal/<%= name %>/tsconfig.json
---
{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist", "**/*.testing.ts", "**/*.testing.tsx"]
}
