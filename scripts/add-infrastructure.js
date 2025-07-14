#!/usr/bin/env node

import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

const infrastructureName = process.argv[2];

if (!infrastructureName) {
  console.error('❌ Please provide an infrastructure name');
  console.log(
    'Usage: node scripts/add-infrastucture.js.js <infrastructure-name> [type]'
  );
  process.exit(1);
}

if (existsSync(join('infrastructure', infrastructureName))) {
  console.error(`❌ Infrastructure "${infrastructureName}" already exists`);
  process.exit(1);
}

const infrastructureDir = join('infrastructure', infrastructureName);
const srcDir = join(infrastructureDir, 'src');

try {
  await mkdir(infrastructureDir, { recursive: true });
  await mkdir(srcDir, { recursive: true });

  // Generate package.json
  const packageJson = generatePackageJson(infrastructureName);
  await writeFile(
    join(infrastructureDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Generate TypeScript config
  const tsConfig = generateTsConfig();
  await writeFile(
    join(infrastructureDir, 'tsconfig.json'),
    JSON.stringify(tsConfig, null, 2)
  );

  // Generate starter files
  const starterFiles = generateStarterFiles();
  for (const [filepath, content] of Object.entries(starterFiles)) {
    const fullPath = join(srcDir, filepath);
    await writeFile(fullPath, content);
  }

  // Generate README
  const readme = generateReadme(infrastructureName);
  await writeFile(join(infrastructureDir, 'README.md'), readme);

  console.log(`✅ Created infrastructure: ${infrastructureName}`);
  console.log(`📁 Location: infrastructure/${infrastructureName}`);
  console.log('');
  console.log('Next steps:');
  console.log(`1. cd infrastructure/${infrastructureName}`);
  console.log('2. pnpm install');
  console.log('3. pnpm build');
  console.log(
    `4. Use in apps: add "@template/${infrastructureName}": "workspace:*" to dependencies in package.json`
  );
} catch (error) {
  console.error('❌ Error creating infrastructure:', error.message);
  process.exit(1);
}

function generatePackageJson(name) {
  return {
    name: `@template/${name}`,
    version: '0.0.0',
    main: 'dist/index.js',
    module: 'dist/index.js',
    types: 'dist/index.d.ts',
    exports: {
      '.': {
        import: './dist/index.js',
        types: './dist/index.d.ts',
      },
    },
    files: ['dist'],
    scripts: {
      build: 'tsc',
      dev: 'tsc --watch',
      test: 'jest',
      'test:watch': 'jest --watch',
      'check-types': 'tsc --noEmit',
      lint: 'eslint src --max-warnings 0',
    },
    dependencies: {
      zod: '3.25.74',
    },
    devDependencies: {
      '@types/node': '^22.15.3',
      '@types/jest': '^29.5.0',
      eslint: '^9.30.0',
      jest: '^29.5.0',
      'ts-jest': '^29.1.0',
      typescript: '5.8.2',
    },
  };
}

function generateTsConfig() {
  return {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      declaration: true,
      declarationMap: true,
      outDir: './dist',
      rootDir: './src',
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      esModuleInterop: true,
      allowSyntheticDefaultImports: true,
      types: ['node', 'jest'],
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', '**/*.testing.ts'],
  };
}

function generateStarterFiles() {
  return {
    'index.ts': '',
  };
}

function generateReadme(name) {
  return `# @template/${name}


## Installation

add
\`\`\`json
 "@template/${name}": "workspace:*"
\`\`\`

to dependencies in package.json

## Usage

\`\`\`typescript
import { /* your imports */ } from '@template/${name}'

// Your usage examples here
\`\`\`

## Development

\`\`\`bash
# Install dependencies
pnpm install

# Build the module
pnpm build

# Watch for changes
pnpm dev

# Run tests
pnpm test

# Type check
pnpm check-types

# Lint
pnpm lint
\`\`\`
`;
}
