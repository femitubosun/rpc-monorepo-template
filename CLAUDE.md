# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Commands

### Development
- `bun dev` - Start all services in development mode
- `bun entry:dev` - Start only the API server
- `bun api:dev` - Start only the API server (alias)

### Build & Check
- `bun run build` - Build all affected packages (uses Nx)
- `bun build:all` - Build all packages
- `bun check-types` - TypeScript check all packages
- `bun lint` - Lint with Biome
- `bun format` - Format code with Biome
- `bun check` - Run Biome check (lint + format)
- `bun check:fix` - Run Biome check with auto-fix

### Testing
- `bun test` - Run tests for all modules
- `bun test:watch` - Run tests in watch mode
- `bun test:modules` - Run tests for modules only

### Database
- `bun db:migrate` - Run Prisma migrations
- `bun db:generate` - Generate Prisma client
- `bun db` - Run Prisma CLI commands
- `bun ensure-prisma` - Generate client + transform types (CI)

### Code Generation
- `bun create:app <name>` - Create new application
- `bun create:package:internal <name>` - Create internal package
- `bun create:package:client <name>` - Create client package
- `bun create:module <name>` - Create new module
- `bun create:infrastructure <name>` - Create infrastructure package

## Architecture Overview

This is a TypeScript monorepo using **Nx** for orchestration and **Bun workspaces**. The codebase follows a modular architecture with a custom **action system** built on BullMQ for distributed business logic.

### Key Technologies
- **Nx 21.2.2** - Build orchestration and caching
- **TypeScript 5.8** - All packages use ES modules with strict settings
- **Biome** - Linting and formatting (replaces ESLint/Prettier)
- **Prisma** - Database ORM with PostgreSQL
- **Hono** - Web framework for API
- **BullMQ** - Queue system for action processing
- **Vitest** - Testing framework

### Directory Structure
```
axon/
├── apps/entry/              # Main API server (Hono)
├── services/worker/         # Background job processor
├── modules/                 # Business logic modules
│   └── auth/
│       ├── __action__/      # Action definitions (schemas)
│       ├── __defs__/        # Type definitions
│       ├── module/          # Action implementations
│       └── api/             # HTTP handlers
├── infrastructure/          # Database, Redis, etc.
├── packages/               # Shared utilities
└── _templates/             # Hygen code generation templates
```

## Action System Architecture

The project uses a custom action system for business logic:

### Action Definitions (`__action__/`)
Actions are defined with schemas using a builder pattern:
```typescript
import { A, G } from '@axon-ai/action';

const AuthAction = G({
  signup: A('auth.signup')
    .input(SignupRequestSchema)
    .output(SignupResponseSchema),

  mail: {
    sendOnboardingMail: A('auth.mail.sendOnboardingMail')
      .input(SendOnboardingMailSchema)
      .async(),
  },
});
```

### Action Implementations (`module/src/actions/`)
Actions are implemented using `module.registerHandlers()`:
```typescript
import module from '../_module';

module.registerHandlers({
  signup: async ({ input, context, makeError }) => {
    // Business logic here
    return { data: result, context: updatedContext };
  },
});
```

### Action Invocation
- **Synchronous**: `await callAction(AuthAction.signup, { input, context })`
- **Asynchronous**: `await enqueueAction(AuthAction.mail.sendOnboardingMail, { input, context })`

## Module Structure Pattern

Each module follows this structure:
- `__action__/` - Action definitions and schemas
- `__defs__/` - Type definitions and schemas
- `module/` - Action implementations and business logic
- `api/` - HTTP handlers and routing

Business logic goes in `module/src/logic/` and is imported via `@logic` alias.

## Environment & Configuration

- Environment variables are managed by `@axon-ai/env` package with Zod validation
- Root `.env` file contains all environment variables
- Environment schemas are in `packages/internal/env/src/env/`
- Database connection is auto-configured via `DATABASE_URL`

## Development Workflow

1. **Database changes**: Run `bun db:migrate` then `bun db:generate`
2. **Code changes**: The monorepo uses Nx caching - builds are incremental
3. **Before committing**: Run `bun check` and `bun check-types`
4. **Testing**: Use `bun test` or `bun test:watch`

## Key Configuration Files

- `nx.json` - Nx configuration with target defaults
- `biome.json` - Linting and formatting rules
- `tsconfig.base.json` - Base TypeScript configuration
- `pnpm-workspace.yaml` - Workspace package locations

## Package Management

- Use `bun` for all package operations
- Workspace packages are referenced by their `@axon-ai/*` names
- Dependencies are managed at the workspace root level
- Node.js version is locked to `^22.11.0`

## Notes

- Main branch is `dev` (not `main`)
- All packages use ES modules with `"type": "module"`
- The action system handles both sync and async operations
- Database migrations are managed through Prisma
- Testing uses Vitest with module-specific configurations
