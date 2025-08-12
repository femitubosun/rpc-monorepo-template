---
to: modules/<%=name%>/__testing__/vitest.config.ts
---
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    tsconfigPaths({
      projects: ["../module/tsconfig.json"],
    }),
  ],
  test: {
    passWithNoTests: true,
    globals: true,
    environment: "node",
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
