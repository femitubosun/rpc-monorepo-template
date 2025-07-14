#!/usr/bin/env node

import { existsSync } from "fs";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";

const appName = process.argv[2];
const appType = process.argv[3] || "node";

if (!appName) {
  console.error("❌ Please provide an app name");
  console.log("Usage: node scripts/add-app.js <app-name> [type]");
  console.log("Types: node, next, hono");
  process.exit(1);
}

if (existsSync(join("apps", appName))) {
  console.error(`❌ App "${appName}" already exists`);
  process.exit(1);
}

const appDir = join("apps", appName);
const srcDir = join(appDir, "src");

try {
  await mkdir(appDir, { recursive: true });
  await mkdir(srcDir, { recursive: true });

  // Generate package.json based on type
  const packageJson = generatePackageJson(appName, appType);
  await writeFile(
    join(appDir, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Generate TypeScript config
  const tsConfig = generateTsConfig(appType);
  await writeFile(
    join(appDir, "tsconfig.json"),
    JSON.stringify(tsConfig, null, 2)
  );

  // Generate starter files
  const starterFiles = generateStarterFiles(appType);
  for (const [filename, content] of Object.entries(starterFiles)) {
    await writeFile(join(srcDir, filename), content);
  }

  console.log(`✅ Created app: ${appName}`);
  console.log(`📁 Location: apps/${appName}`);
  console.log(`🚀 Type: ${appType}`);
  console.log("");
  console.log("Next steps:");
  console.log(`1. cd apps/${appName}`);
  console.log("2. pnpm install");
  console.log("3. pnpm dev");
} catch (error) {
  console.error("❌ Error creating app:", error.message);
  process.exit(1);
}

function generatePackageJson(name, type) {
  const base = {
    name: `@template/${name}`,
    private: true,
    version: "0.0.0",
    type: "module",
  };

  switch (type) {
    case "next":
      return {
        ...base,
        scripts: {
          dev: "next dev --turbopack",
          build: "next build",
          start: "next start",
          "check-types": "tsc --noEmit",
          lint: "next lint --max-warnings 0",
        },
        dependencies: {
          zod: "3.25.74",
        },
        devDependencies: {
          "@types/node": "^22.15.3",
          "@types/react": "19.1.0",
          "@types/react-dom": "19.1.1",
          eslint: "^9.30.0",
          typescript: "5.8.2",
        },
      };

    case "hono":
      return {
        ...base,
        scripts: {
          dev: "tsx watch src/index.ts",
          build: "tsc",
          start: "node dist/index.js",
          "check-types": "tsc --noEmit",
          lint: "eslint src --max-warnings 0",
        },
        dependencies: {
          hono: "^4.8.3",
          "@hono/node-server": "^1.13.7",
          zod: "3.25.74",
        },
        devDependencies: {
          "@types/node": "^22.15.3",
          eslint: "^9.30.0",
          tsx: "^4.20.3",
          typescript: "5.8.2",
        },
      };

    default: // node
      return {
        ...base,
        scripts: {
          dev: "tsx watch src/index.ts",
          build: "tsc",
          start: "node dist/index.js",
          "check-types": "tsc --noEmit",
          lint: "eslint src --max-warnings 0",
        },
        dependencies: {
          zod: "3.25.74",
        },
        devDependencies: {
          "@types/node": "^22.15.3",
          eslint: "^9.30.0",
          tsx: "^4.20.3",
          typescript: "5.8.2",
        },
      };
  }
}

function generateTsConfig(type) {
  const base = {
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "bundler",
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      types: ["node"],
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist"],
  };

  switch (type) {
    case "next":
      return {
        ...base,
        compilerOptions: {
          ...base.compilerOptions,
          lib: ["dom", "dom.iterable", "ES6"],
          allowJs: true,
          noEmit: true,
          esModuleInterop: true,
          moduleResolution: "bundler",
          jsx: "preserve",
          incremental: true,
          plugins: [{ name: "next" }],
          types: ["node"],
        },
        include: [
          "next-env.d.ts",
          "**/*.ts",
          "**/*.tsx",
          ".next/types/**/*.ts",
        ],
        exclude: ["node_modules"],
      };

    default:
      return {
        ...base,
        compilerOptions: {
          ...base.compilerOptions,
          declaration: true,
          outDir: "./dist",
          rootDir: "./src",
        },
      };
  }
}

function generateStarterFiles(type) {
  switch (type) {
    case "next":
      return {
        "page.tsx": `export default function HomePage() {
  return (
    <div>
      <h1>Welcome to your Next.js App</h1>
      <p>Start building your application!</p>
    </div>
  )
}`,
        "layout.tsx": `import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'My App',
  description: 'Created with Template workspace',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`,
      };

    case "hono":
      return {
        "index.ts": `import { Hono } from 'hono'
import { serve } from '@hono/node-server'

const app = new Hono()

app.get('/', (c) => {
  return c.json({ message: 'Hello from your new Hono API!' })
})

app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const port = parseInt(process.env.PORT || '3000')

console.log(\`Starting server on port \${port}\`)

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(\`🚀 Server is running on http://localhost:\${info.port}\`)
})`,
      };

    default: // node
      return {
        "index.ts": `console.log('Hello from your new Node.js app!')

export function main() {
  console.log('Application started')
}

if (import.meta.url === \`file://\${process.argv[1]}\`) {
  main()
}`,
      };
  }
}
