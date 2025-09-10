# Axon AI MVP

A TypeScript monorepo using Nx for build orchestration and pnpm workspaces for package management. This project follows a modular architecture with clear separation between applications, shared packages, and infrastructure.

## Architecture

```
axon/
├── apps/
│   └── entry/               # Main API server (Hono)
├── services/
│   └── worker/              # Background job processor
├── packages/
│   ├── clients/
│   │   ├── github/          # GitHub API client
│   │   ├── http/            # HTTP client utilities
│   │   └── resend/          # Resend email client
│   └── internal/
│       ├── action/          # Action system core
│       ├── api-utils/       # API utilities
│       ├── app-defs/        # App definitions and types
│       ├── cache/           # Cache utilities and helpers
│       ├── env/             # Environment configuration with Zod validation
│       ├── error/           # Error handling utilities
│       ├── logging/         # Logging utilities with Pino
│       ├── mail/            # Mail utilities
│       ├── prisma-defs/     # Generated Prisma types and schemas
│       ├── router/          # Router helpers and utilities
│       ├── testing/         # Vitest setup and testing utilities
│       └── ...              # Additional utility packages
├── infrastructure/
│   ├── db/                  # Database (Prisma + PostgreSQL)
│   └── redis/               # Redis infrastructure
├── modules/
│   ├── auth/                # Authentication module
│   └── developer-profile/   # Developer profile module
└── scripts/                 # Code generation and utility scripts
```

## Key Technologies

- **Nx 21.2.2** - Build system and monorepo management
- **Node 22.17.1** - Node version
- **TypeScript 5.8.2** - All packages use ES modules
- **Prisma 6.11.1** - PostgreSQL ORM with generated client
- **Hono 4.8.4** - Web framework for API server
- **Zod 3.25.74** - Schema validation (especially for environment config)
- **pnpm** - Package manager with workspace support

## Setup

1. **Install dependencies**:
   ```bash
   bun install
   ```

2. **Build all packages**:
   ```bash
   bun run build
   ```

3. **Migrate Database**:
   ```bash
   bun db:migrate
   ```

4. **Generate Prisma Type Definitions**:
   ```bash
   bun db:generate
   ```

5. **Ensure Prisma CI**:
   ```bash
   bun ensure-prisma-ci
   ```

6. **Start development**:
   ```bash
   bun entry:dev      # Main API server
   ```

## Available Scripts

### Core Development
- `pnpm build` - Build all packages
- `pnpm dev` - Run all packages in development mode
- `pnpm entry:dev` - Run main API server specifically
- `pnpm clean` - Clean all build artifacts and node_modules
- `pnpm lint` - Lint all packages with Biome
- `pnpm format` - Format all files with Biome
- `pnpm check-types` - TypeScript check all packages

### Database Operations
- `pnpm db:generate` - Generate Prisma client and types
- `pnpm db:migrate` - Run database migrations
- `pnpm db` - Run Prisma CLI commands directly
- `pnpm ensure-prisma` - Generate Prisma client and transform types (CI)

### Code Generation
- `pnpm create:app <name> [type]` - Create new application
- `pnpm create:package <name> [location]` - Create new package
- `pnpm create:module <name>` - Create new module
- `pnpm create:infrastructure <name>` - Create infrastructure package

## Environment Configuration

The `@axon-ai/env` package provides validated environment configuration using Zod schemas:

- **Root .env file**: Contains all environment variables
- **Schema definitions**: Located in `packages/internal/env/src/env/`
- **Usage**: `import { Env } from '@axon-ai/env'`

## Database

- **Provider**: PostgreSQL
- **ORM**: Prisma
- **Schema**: `infrastructure/db/prisma/schema.prisma`
- **Generated client**: `infrastructure/db/src/generated/prisma/`

The database package exports a pre-configured Prisma client that automatically uses the `DATABASE_URL` from environment configuration.

## Action System Architecture

This project uses a **custom action system** built on top of **BullMQ** for handling business logic in a distributed, queue-based manner.

### Action Definition Pattern

Actions are defined in `__action__` directories using a builder pattern:

```typescript
// modules/auth/__action__/src/index.ts
import { A, G } from '@axon-ai/action';

const AuthAction = G({
  signup: A('auth.signup')
    .input(SignupRequestSchema)
    .output(SignupResponseSchema),

  session: {
    create: A('auth.session.create')
      .input(SessionInputSchema)
      .output(SessionSchema).async(),
  },
});
```

**Key components:**
- `A(actionName)` - Creates an action definition
- `.input(schema)` - Defines input validation schema (Zod)
- `.output(schema)` - Defines output validation schema (Zod)
- `G({})` - Groups related actions into namespaces
- `.async()` - Flag for asynchronous actions

### Action Implementation Pattern

Actions are implemented in `module/src/actions/` using `module.registerHandlers()`:

```typescript
// modules/auth/module/src/actions/signup.ts
import module from '../_module';

module.registerHandlers({
  signup: async ({ input, context, makeError }) => {
    // Business logic here
    return {
      data: result,
      context: updatedContext,
    };
  },
});
```

**Handler signature:**
- `input` - Validated input data (from schema)
- `context` - Request context (user, session, etc.)
- `makeError` - Error factory for consistent error handling
- Returns `{ data, context }` - Result data and updated context

### Action Invocation Patterns

**Synchronous calls** (wait for result):
```typescript
import { callAction } from '@axon-ai/action';
const { data } = await callAction(AuthAction.session.create, {
  input: { user, version: 1 },
  context,
});
```

**Asynchronous calls** (fire-and-forget):
```typescript
import { enqueueAction } from '@axon-ai/action';
await enqueueAction(AuthAction.mail.sendOnboardingMail, {
  input: { email, name },
  context,
});
```

### Module Structure

```
modules/auth/
├── __action__/          # Action definitions (schemas)
│   └── src/index.ts     # Export action definitions
├── __defs__/           # Type definitions
├── module/             # Action implementations
│   └── src/actions/    # Handler implementations
└── api/                # HTTP API layer
```

### Error Handling

- All actions use centralized error handling via `makeError`
- Errors are serialized through BullMQ and properly typed
- Custom `AppError` class with structured error information

### Logic Layer

Shared business logic is placed in `module/src/logic/`:

```typescript
// modules/auth/module/src/logic/session.ts
export function generateSessionId() {
  return randomBytes(32).toString('hex');
}
```

Import via barrel exports:
```typescript
import { generateSessionId } from '@logic';
```

## Project Structure Details

### Applications (`apps/`)
- **entry**: Main Hono-based REST API server

### Services (`services/`)
- **worker**: Background job processor for the action system

### Client Packages (`packages/clients/`)
- **github**: GitHub API client
- **http**: HTTP client utilities
- **resend**: Resend email service client

### Internal Packages (`packages/internal/`)
- **action**: Core action system implementation
- **api-utils**: API utilities and helpers
- **app-defs**: Application definitions and types
- **app-utils**: General application utilities
- **cache-utils**: Cache utilities and key builders
- **cache**: Cache implementation
- **db-utils**: Database utilities and helpers
- **env**: Environment configuration with Zod validation
- **error**: Error handling utilities
- **hash-utils**: Hashing utilities
- **logging**: Logging utilities with Pino integration
- **mail**: Mail utilities and templates
- **pkce**: PKCE utilities for OAuth
- **prisma-defs**: Generated Prisma types and transformations
- **router**: Router helpers and utilities
- **testing**: Vitest setup and testing utilities

### Infrastructure (`infrastructure/`)
- **db**: Database layer with Prisma client
- **redis**: Redis infrastructure and utilities

### Modules (`modules/`)
- **auth**: Authentication module with API handlers and routing
- **developer-profile**: Developer profile management module

### Scripts (`scripts/`)
- **clean.js**: Comprehensive cleanup script
- **add-*.js**: Code generation utilities for apps, packages, and infrastructure

## Development Workflow

1. **Make changes** to your code
2. **Run type checking**: `pnpm check-types`
3. **Run linting**: `pnpm lint`
4. **Format code**: `pnpm format`
5. **Build**: `pnpm build`
6. **Test**: Individual packages have their own test commands

## Nx Commands

You can also use Nx directly for more granular control:

```bash
# Build specific package
nx build @axon-ai/entry

# Run development mode for specific package
nx dev @axon-ai/entry

# Run any task for specific project
nx <target> <project-name>
```

## Requirements

- **Node.js**: 22.11.0 (specified in package.json engines)
- **pnpm**: Latest version recommended
- **PostgreSQL**: For database operations

## Version Control

The codebase is managed using GIT and the branch management philosophy is a hybrid of Gitflow called HubFlow. HubFlow seeks to integrate a seamless workflow where teams can utilize GitFlow against the Github Online Infrastructure.

### HubFlow Installation

**Windows**

`<git-install-dir>` is usually `C:\Program Files\Git`

```
git clone https://github.com/datasift/gitflow hubflow
cd hubflow

cp git-hf* "<git-install-dir>/bin/"
cp hubflow-common <git-install-dir>/bin/

git submodule update --remote --init --checkout
cp shFlags/src/shflags "<git-install-dir>/bin/hubflow-shFlags"
```

**Mac or Linux**

To install HubFlow on your local machine, you can run the following commands anywhere on your machine outside of the project folder

```
git clone https://github.com/datasift/gitflow
cd gitflow
sudo ./install.sh
sudo git hf upgrade
```

To test the installation and list the available commands, run the following:

```
git hf help
```

### HubFlow Commands

1. Initialize HubFlow Tools (Run within the project folder)

```
git hf init -af
```

Populate the necessary values i.e.

- `main` branch for the most stable version of the project that can be deployed to production.
- `dev` branch for development which acts as the base branch for all feature development.
- `feature` branch for implementing new features and serves to isolate development without disrupting the stability of the codebase
- `release` branch for features that are ready to be deployed. Only bug fixes and docs should be added to this branch
- `hotfix` branch for quickly fixing critical issues/bugs in the main branch that require an immediate patch.
- `support` branch for long-lived branches that are aimed at maintaining older versions of the codebase no longer actively being developed
- `version` prefix tag is used to uniquely identify releases, this should be left **BLANK** with no values in it.

2. Create a feature branch

```
git hf feature start <FEATURE_BRANCH_NAME>
```

If you are starting to work on an existing feature branch, do this:

```
git hf feature checkout <FEATURE_BRANCH_NAME>
```

3. Publish the feature branch

```
git hf push
```

Once you have completed your feature implementation, initiate a pull request on the Github Repository from your `feature` branch into the `dev` branch, only after your PR has been merged into `dev` can you close out the feature branch locally on your machine. This is called a **FEATURE FINISH**

4. Finish the feature branch

```
git hf feature finish <FEATURE_BRANCH_NAME>
```

<br>

For more details about the other commands, visit - https://datasift.github.io/gitflow/GitFlowForGitHub.html

<br><br>
