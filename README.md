# Hono RPC Monorepo Template

A **production-ready TypeScript monorepo template** using **Nx** for build orchestration and **pnpm workspaces** for package management. This template provides a solid foundation for building scalable web applications with clear separation between applications, shared packages, and infrastructure.

## 🚀 Getting Started with This Template

### Option 1: Use as GitHub Template
1. Click "Use this template" button on GitHub
2. Create your new repository
3. Clone your new repository
4. Follow the setup instructions below

### Option 2: Clone and Customize
```bash
git clone git@github.com:femitubosun/rpc-monorepo-template.git your-project-name
cd your-project-name
rm -rf .git
git init
git add .
git commit -m "Initial commit from template"
```

## 📋 Prerequisites

- **Node.js 22.11.0** (specified in package.json engines)
- **pnpm** (latest version recommended)
- **PostgreSQL** (for database operations)

## ⚡ Quick Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Set up environment**: (uses dotenvx)
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```



3. **Set up lefthook**
  ```bash
  pnpm lefthook install
  ```

4. **Initialize database**:
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```

5. **Start development**:
   ```bash
   pnpm dev
   ```

## 🏗️ What This Template Provides

- **🚀 Hono-based API server** with TypeScript and RPC capabilities
- **📦 Nx monorepo** with optimized build caching and task orchestration
- **🗃️ PostgreSQL + Prisma** with type-safe database operations
- **⚡ Redis integration** for caching and session management
- **🔐 JWT Authentication system** with email + OTP verification
- **🔧 Environment validation** using Zod schemas
- **🧪 Testing setup** with Vitest and testing utilities
- **📝 Code generation** scripts for rapid development
- **🎨 ESLint + Prettier** for consistent code formatting
- **📋 Comprehensive logging** with Pino integration
- **🏗️ Modular architecture** with clear separation of concerns

## Architecture

```
your-project-name/
├── apps/
│   └── entry/               # Main application entry point with Hono server
├── packages/
│   ├── clients/             # External client packages
│   │   └── resend/          # Resend email client
│   └── internal/            # Internal shared packages
│       ├── action/          # Action/RPC system for type-safe API calls
│       ├── api-utils/       # API utilities and helpers
│       ├── app-defs/        # Application type definitions
│       ├── app-utils/       # Application utilities
│       ├── cache/           # Cache utilities and helpers
│       ├── db-utils/        # Database utilities and helpers
│       ├── env/             # Environment configuration with Zod validation
│       ├── error/           # Error handling utilities
│       ├── hash-utils/      # Hashing utilities
│       ├── logging/         # Logging utilities with Pino
│       ├── prisma-defs/     # Generated Prisma types and schemas
│       ├── router/          # Router helpers and utilities
│       └── testing/         # Vitest setup and testing utilities
├── infrastructure/
│   ├── db/                  # Database (Prisma + PostgreSQL)
│   └── redis/               # Redis infrastructure
├── modules/
│   └── auth/                # Authentication module
│       ├── __action__/      # Action definitions
│       ├── __defs__/        # Type definitions
│       ├── api/             # API handlers and routes
│       └── module/          # Business logic
├── services/
│   └── worker/              # Background worker service
├── scripts/                 # Code generation and utility scripts
└── _templates/              # Hygen templates for code generation
```

## Key Technologies

- **Nx 21.2.2** - Build system and monorepo management
- **TypeScript 5.8.3** - All packages use ES modules
- **Prisma 6.11.1** - PostgreSQL ORM with generated client
- **Hono 4.8.4** - Web framework for API server
- **Zod 3.25.74** - Schema validation (especially for environment config)
- **pnpm** - Package manager with workspace support

## 🔐 Authentication System

This template includes a complete JWT-based authentication system with the following features:

### **Authentication Flow**
1. **Email + OTP Verification**: Users sign in using email and receive a one-time code
2. **JWT Token Generation**: Upon successful OTP verification, a JWT token is issued
3. **Redis Session Storage**: User sessions are stored in Redis for fast lookup and invalidation
4. **Route Protection**: Protected routes validate JWT tokens and check session validity

### **Key Components**
- **Auth Module**: Located in `modules/auth/` with complete signup/signin/logout functionality
- **Session Management**: Redis-based session storage with automatic expiration
- **JWT Utilities**: Token generation, verification, and validation in `packages/internal/api-utils/`
- **Route Protection**: Use `getAppActor()` to protect routes and extract user context

### **Usage Example**
```typescript
// Protect a route
import { getAppActor } from '@template/api-utils';

const protectedHandler = async (c: Context) => {
  const user = await getAppActor(c); // Throws if not authenticated
  // User is authenticated, proceed with protected logic
};

// Logout functionality
import { logout } from '@modules/auth/module';
await callAction(logout, { user });
```

### **Available Auth Endpoints**
- `POST /auth/signup` - User registration
- `POST /auth/signin` - Sign in with email (sends OTP)
- `POST /auth/use-code` - Verify OTP and get JWT token
- `POST /auth/logout` - Invalidate session and logout

## 🎯 Customizing for Your Project

After setting up the template, you'll want to customize it for your specific project:

### 1. **Update Package Names**
- Search and replace `@template/` with your project's scope (e.g., `@mycompany/`)
- Update `package.json` files throughout the monorepo
- Update import statements in TypeScript files

### 2. **Configure Environment Variables**
- Copy `.env.example` to `.env`
- Update `packages/internal/env/src/env/` schemas for your specific needs
- Add your database URL, Redis URL, JWT secret, and other configuration

### 3. **Database Schema**
- Modify `infrastructure/db/prisma/schema.prisma` for your data model
- Run `pnpm db:migrate` to apply changes
- Update seed files if needed

### 4. **Customize Services and Entry Points**
- The `services/worker/` is an example background service
- The `apps/entry/` is the main application entry point
- Use code generation scripts to create new components

### 5. **Project Branding**
- Update this README.md
- Change project name in `package.json`
- Update any hardcoded references to the template name

## 🚀 Creating Endpoints: The Complete Flow

This template uses a **modular RPC-style architecture** that separates routing, handlers, and business logic. Here's how to create a new endpoint with full type safety:

### 1. **Create a Module**
```bash
pnpm create:module user-management
```

This generates:
```
modules/user-management/
├── api/                    # API layer
│   ├── src/
│   │   ├── handlers/       # HTTP request handlers
│   │   │   └── index.ts    # Handler implementations
│   │   ├── router/         # Route definitions
│   │   │   └── index.ts    # Hono router setup
│   │   └── index.ts        # API package exports
│   └── package.json
├── __actions__/            # Action definitions (contracts)
│   ├── src/
│   │   └── index.ts        # Action input/output types
│   └── package.json
├── __defs__/              # Type definitions
│   └── src/
│       └── index.ts        # Shared types
└── module/                 # Business logic
    ├── src/
    │   ├── actions/        # Action implementations
    │   │   └── index.ts    # Business logic handlers
    │   └── _module.ts      # Module configuration
    └── package.json
```

### 2. **Define Action Schema** (`__action__/src/index.ts`)
```typescript
import { A, G } from '@template/action';
import { z } from 'zod';

// Define input/output schemas
const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
});

// Define action group
const UserAction = G({
  create: A('user.create')
    .input(CreateUserSchema)
    .output(UserResponseSchema),

  get: A('user.get')
    .input(z.object({ id: z.string() }))
    .output(UserResponseSchema),
});

export { UserAction };
```

### 3. **Implement Action Logic** (`module/src/actions/create.ts`)
```typescript
import module from '../_module';

module.registerHandlers({
  create: async ({ input, context, makeError }) => {
    // Business logic here
    const user = await db.user.create({
      data: input,
    });

    return {
      context,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  },
});
```

### 4. **Create Module Configuration** (`module/src/_module.ts`)
```typescript
import { makeModule } from '@template/action';
import { UserAction } from '../../__action__/src';

const module = makeModule('user', UserAction);

export default module;
```

### 5. **Create API Handlers** (`api/src/handlers/index.ts`)
```typescript
import { callAction } from '@template/action';
import { getAppActor } from '@template/api-utils';
import { UserAction } from '../../__action__/src';
import { ModuleRouterHandler } from '@template/router';
import { router } from '../router';

export const _handlers: ModuleRouterHandler<typeof router> = {
  create: async (c) => {
    const input = c.req.valid('json');
    const { context } = await getAppActor(c.req); // For authenticated routes

    const { data } = await callAction(UserAction.create, {
      input,
      context,
    });

    return c.json(data, 201);
  },

  get: async (c) => {
    const { id } = c.req.param();
    const { context } = await getAppActor(c.req); // For authenticated routes

    const { data } = await callAction(UserAction.get, {
      input: { id },
      context,
    });

    return c.json(data, 200);
  },

  // For public routes (no authentication required)
  public: async (c) => {
    const input = c.req.valid('json');

    const { data } = await callAction(UserAction.public, {
      input,
      context: {}, // Empty context for public routes
    });

    return c.json(data, 200);
  },
};
```

### 6. **Define Routes** (`api/src/router/index.ts`)
```typescript
import { Route } from '@template/router';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});

const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  createdAt: z.date(),
});

export const router = {
  create: Route.post('/users')
    .jsonBody(CreateUserSchema)
    .tags(['User'])
    .jsonResponse(201, 'User created successfully', UserResponseSchema)
    .build(),

  get: Route.get('/users/:id')
    .tags(['User'])
    .jsonResponse(200, 'User retrieved successfully', UserResponseSchema)
    .build(),
};
```

### 7. **Register Routes** (`api/src/index.ts`)
```typescript
import { CreateAppRouter } from '@template/router';
import { router as _router } from './router';
import { _handlers } from './handlers';
import Module from '../module/src/_module';

export function router() {
  const router = CreateAppRouter();
  Module.registerRoutes(router, _router, _handlers);
  return router;
}
```

### 8. **Auto-Loading**
The template automatically loads modules in `apps/entry/src/server/libs/auto-load-modules.ts`. Your new routes will be available at `/api/users`.

### 🎯 **Key Benefits of This Flow**

- **🔒 Type Safety**: End-to-end TypeScript types from input to output
- **📝 Contract-First**: Actions define clear input/output contracts
- **🔄 Reusable Logic**: Actions can be called from HTTP handlers, workers, or other modules
- **🧪 Testable**: Each layer can be tested independently
- **📚 Self-Documenting**: Clear separation makes code easy to understand
- **⚡ Auto-Loading**: No manual route registration needed

### 🔧 **Advanced Patterns**

**Calling Actions from Other Modules:**
```typescript
import { callAction } from '@template/action';
import { UserAction } from '@modules/user-management/__action__';

const result = await callAction(UserAction.create, {
  input: { name: 'John', email: 'john@example.com' },
  context: c,
});
```

**Action Composition:**
```typescript
// In module/src/actions/create-with-profile.ts
module.registerHandlers({
  createWithProfile: async ({ input, context, makeError }) => {
    const { data: user } = await callAction(UserAction.create, {
      input: input.user,
      context,
    });

    const { data: profile } = await callAction(ProfileAction.create, {
      input: { ...input.profile, userId: user.id },
      context,
    });

    return {
      context,
      data: { user, profile },
    };
  },
});
```

### 🚀 **Improved Route Definition**

For better OpenAPI documentation and type safety, use the enhanced route definition helpers:

**Instead of basic Hono routes:**
```typescript
// ❌ Basic approach
router.post('/users', userHandlers.createUser);
```

**Use the Route builder pattern:**
```typescript
// ✅ Enhanced approach with OpenAPI support
import { Route } from '@template/router';
import { UserAction } from '../__action__/src';

const createUserRoute = Route.post('/users')
  .jsonBody(UserAction.create.input)
  .tags(['User'])
  .jsonResponse(201, 'User created successfully', UserAction.create.output)
  .build();

// Routes are automatically registered via Module.registerRoutes()
```

**Benefits of Enhanced Route Definition:**
- **📋 Auto-generated OpenAPI docs**: Routes automatically generate Swagger documentation
- **🔒 Request/response validation**: Input and output validation based on Zod schemas
- **📝 Type safety**: Full TypeScript support for request/response types
- **🎯 Consistent API design**: Standardized approach across all routes
- **🔍 Better error handling**: Automatic validation error responses

**Available Route Builder Methods:**
```typescript
import { Route } from '@template/router';
import { z } from 'zod';

// GET route with query parameters
const getUsersRoute = Route.get('/users')
  .query(z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }))
  .tags(['User'])
  .jsonResponse(200, 'Users retrieved successfully', z.object({
    users: z.array(UserAction.get.output),
    total: z.number(),
  }))
  .build();

// PUT route with path parameters
const updateUserRoute = Route.put('/users/:id')
  .jsonBody(UserAction.update.input)
  .tags(['User'])
  .jsonResponse(200, 'User updated successfully', UserAction.update.output)
  .build();

// DELETE route
const deleteUserRoute = Route.delete('/users/:id')
  .tags(['User'])
  .jsonResponse(204, 'User deleted successfully', z.object({}))
  .build();
```

## 🔧 Development Setup

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Generate Prisma client**:
   ```bash
   pnpm db:generate
   ```

3. **Migrate Database **:
   ```bash
   pnpm db:migrate
   ```

4. **Build all packages**:
   ```bash
   pnpm build
   ```

5. **Start development**:
   ```bash
   pnpm dev          # All packages
   pnpm api:dev      # API server only
   ```

## Available Scripts

### Core Development

- `pnpm build` - Build all packages
- `pnpm dev` - Run all packages in development mode
- `pnpm api:dev` - Run API server specifically
- `pnpm clean` - Clean all build artifacts and node_modules
- `pnpm lint` - ESLint all packages
- `pnpm format` - Format all files with Prettier
- `pnpm check-types` - TypeScript check all packages

### Database Operations

- `pnpm db:generate` - Generate Prisma client and types
- `pnpm db:migrate` - Run database migrations
- `pnpm db` - Run Prisma CLI commands directly
- `pnpm ensure-prisma-ci` - Generate Prisma client and transform types (CI)

### Code Generation

- `pnpm create:app <name> [type]` - Create new application
- `pnpm create:package <name> [location]` - Create new package
- `pnpm create:module <name>` - Create new module
- `pnpm create:infrastructure <name>` - Create infrastructure package

## Environment Configuration

The `@template/env` package provides validated environment configuration using Zod schemas:

- **Root .env file**: Contains all environment variables
- **Schema definitions**: Located in `packages/internal/env/src/env/`
- **Usage**: `import { Env } from '@template/env'`

## Database

- **Provider**: PostgreSQL
- **ORM**: Prisma
- **Schema**: `infrastructure/db/prisma/schema.prisma`
- **Generated client**: `infrastructure/db/src/generated/prisma/`

The database package exports a pre-configured Prisma client that automatically uses the `DATABASE_URL` from environment
configuration.

## Project Structure Details

### Applications (`apps/`)

- **entry**: Main application entry point with Hono server and auto-loading modules

### Internal Packages (`packages/internal/`)

- **env**: Environment configuration with Zod validation
- **testing**: Vitest setup, Faker utilities, and testing helpers
- **prisma-defs**: Generated Prisma types and transformations
- **cache**: Cache utilities and helpers with key builders
- **logging**: Logging utilities with Pino integration
- **router**: Router helpers and utilities for API routing
- **action**: Action/RPC system for type-safe API calls and module management

### Infrastructure (`infrastructure/`)

- **db**: Database layer with Prisma client
- **redis**: Redis infrastructure and utilities

### Services (`services/`)

- **worker**: Background worker service with auto-loading modules

### Scripts (`scripts/`)

- **clean.js**: Comprehensive cleanup script
- **add-app.js**: Code generation utility for creating new applications
- **add-infrastructure.js**: Code generation utility for infrastructure packages

### Templates (`_templates/`)

- **Hygen templates**: Code generation templates for creating modules, packages, and applications

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
nx build @template/api

# Run development mode for specific package
nx dev @template/api

# Run any task for specific project
nx <target> <project-name>
```

## 🤝 Contributing

When contributing to this template:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Run the full test suite**: `pnpm check-types && pnpm lint && pnpm build`
5. **Commit your changes**: `git commit -m 'Add amazing feature'`
6. **Push to your branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**

## 📖 Learn More

- [Nx Documentation](https://nx.dev/getting-started/intro)
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with [Nx](https://nx.dev/) for monorepo management
- API framework powered by [Hono](https://hono.dev/)
- Database operations with [Prisma](https://www.prisma.io/)
- Package management with [pnpm](https://pnpm.io/)

---

**Happy coding! 🚀**
