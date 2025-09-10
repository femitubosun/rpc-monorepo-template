# @template/action

The core action system for Axon AI's modular RPC-style architecture. This package provides type-safe, contract-driven business logic execution with support for both synchronous and asynchronous (queue-based) processing.

## Overview

The action system enables:
- **Type-safe RPC**: End-to-end TypeScript safety with Zod validation
- **Modular architecture**: Domain-bounded modules with clear contracts
- **Queue-based processing**: Background job execution with BullMQ
- **Cron scheduling**: Automated task execution
- **Auto-discovery**: Automatic module loading and registration

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Layer     │    │  Action Layer   │    │ Database Layer  │
│                 │    │                 │    │                 │
│ HTTP Handlers   │───▶│ Business Logic  │───▶│ Database Ops    │
│ Input Validation│    │ Action Handlers │    │ Data Validation │
│ Context Mgmt    │    │ Error Handling  │    │ Relations       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         │              │  Queue System   │              │
         └──────────────│ Background Jobs │──────────────┘
                        │ Cron Tasks      │
                        │ Scheduling      │
                        └─────────────────┘
```

## Installation

```bash
pnpm add @template/action@workspace:*
```

## Core Concepts

### 1. Actions

Actions are type-safe RPC contracts that define input/output schemas and business logic:

```typescript
import { A } from '@template/action';
import z from 'zod';

const userGetById = A('user.getById')
  .input(z.object({ id: z.string() }))
  .output(UserOutput);
```

### 2. Action Groups

Actions are organized into hierarchical groups for better modularity:

```typescript
import { G } from '@template/action';

const userActions = G({
  getById: A('user.getById')
    .input(z.object({ id: z.string() }))
    .output(UserOutput),

  create: A('user.create')
    .input(CreateUserInput)
    .output(UserOutput),

  profile: {
    update: A('user.profile.update')
      .input(UpdateProfileInput)
      .output(UserOutput),
  },
});
```

### 3. Modules

Modules bind action definitions with their implementations:

```typescript
import { makeModule } from '@template/action';

const module = makeModule('user', userActions);

// Register business logic handlers
module.registerHandlers({
  getById: async ({ input, context, makeError }) => {
    const user = await db.user.findUnique({ where: { id: input.id } });

    if (!user) {
      throw makeError({
        type: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return { data: user, context };
  },

  profile: {
    update: async ({ input, context }) => {
      // Implementation here
      return { data: updatedUser, context };
    },
  },
});
```

## Usage Patterns

### Defining Actions

Create action definitions in `__action__` directories:

```typescript
// modules/marketplace/__action__/src/booking.ts
import { A, G } from '@template/action';
import { BookingOutput, CreateBookingInput } from '@template/marketplace-defs';

export const booking = G({
  create: A('marketplace.booking.create')
    .input(CreateBookingInput)
    .output(BookingOutput),

  getById: A('marketplace.booking.getById')
    .input(z.object({ id: z.string() }))
    .output(BookingOutput),

  respond: A('marketplace.booking.respond')
    .input(BookingApprovalInput)
    .output(BookingOutput),
});
```

### Creating Modules

Create modules in `module/src/_module.ts`:

```typescript
// modules/marketplace/module/src/_module.ts
import { makeModule } from '@template/action';
import actionGroup from '@template/marketplace-action-defs';

const module = makeModule('marketplace', actionGroup);

export default module;
```

### Implementing Handlers

Implement business logic in `module/src/actions/`:

```typescript
// modules/marketplace/module/src/actions/booking/create.ts
import module from '@module';

module.registerHandlers({
  booking: {
    create: async ({ input, context, makeError, cacheKey }) => {
      // Validate business rules
      if (!input.brandId) {
        throw makeError({
          type: 'BAD_REQUEST',
          message: 'Brand ID is required',
        });
      }

      // Database operations
      const booking = await db.booking.create({
        data: input,
        select: zodToPrismaSelect(BookingOutput),
      });

      // Cache management
      await cache.invalidateByTag([cacheKey.moduleTag]);

      return {
        data: BookingOutput.parse(booking),
        context,
      };
    },
  },
});
```

### Calling Actions

#### Synchronous Execution

Use `callAction()` for immediate execution:

```typescript
import { callAction } from '@template/action';
import MarketplaceActions from '@template/marketplace-action-defs';

// In API handlers
export const createBooking = async (c) => {
  const { context } = await getAppActor(c.req);
  const input = c.req.valid('json');

  const { data } = await callAction(
    MarketplaceActions.booking.create,
    { input, context }
  );

  return c.json(data, 201);
};
```

#### Asynchronous Execution

Use `scheduleAction()` for background processing:

```typescript
import { scheduleAction } from '@template/action';

// Schedule immediate execution
await scheduleAction(MarketplaceActions.mail.booking.created, {
  input: { bookingId: booking.id },
  context,
});

// Schedule future execution
await scheduleAction(MarketplaceActions.booking.remind, {
  input: { bookingId: booking.id },
  context,
  scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
});
```

## Advanced Features

### Cron Jobs

Schedule recurring tasks using cron expressions:

```typescript
const backup = A('system.backup')
  .input(z.object({}))
  .output(z.object({ success: z.boolean() }))
  .settings({
    cron: 'DAILY', // Predefined schedules
    concurrency: 1,
  });

// Implementation
module.registerHandlers({
  system: {
    backup: async ({ context }) => {
      // Perform daily backup
      return { data: { success: true }, context };
    },
  },
});
```

### Queue Settings

Configure queue behavior with settings:

```typescript
const processPayment = A('finance.payment.process')
  .input(ProcessPaymentInput)
  .output(PaymentOutput)
  .settings({
    concurrency: 5,        // Max concurrent jobs
    retry: 3,              // Retry attempts
    backoff: 'exponential', // Backoff strategy
  });
```

### Error Handling

Use typed error handling with `makeError`:

```typescript
module.registerHandlers({
  booking: {
    approve: async ({ input, makeError }) => {
      const booking = await db.booking.findUnique({
        where: { id: input.id },
      });

      if (!booking) {
        throw makeError({
          type: 'NOT_FOUND',
          message: 'Booking not found',
        });
      }

      if (booking.status !== 'PENDING') {
        throw makeError({
          type: 'BAD_REQUEST',
          message: 'Only pending bookings can be approved',
        });
      }

      // Continue with approval logic...
    },
  },
});
```

### Cache Integration

Use built-in cache utilities for performance:

```typescript
module.registerHandlers({
  offering: {
    create: async ({ input, context, cacheKey }) => {
      // Set cache ownership
      cacheKey.owner(input.creatorId);

      const offering = await db.offering.create({ data: input });

      // Invalidate related caches
      await cache.invalidateByTag([
        cacheKey.ownerTag,
        'marketplace',
        'discovery',
      ]);

      return { data: offering, context };
    },
  },
});
```

## Runtime & Initialization

The action system runtime manages module loading and queue processing:

```typescript
import { runtime } from '@template/action';
import { autoLoadModules } from './auto-load-modules';
import { queue } from './queue';

// Initialize runtime with auto-discovered modules
const modules = await autoLoadModules();
runtime.init(modules, queue);

// Start background processing
await runtime.start();
```

## Testing

Test action handlers in isolation:

```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import module from '../_module';

describe('booking actions', () => {
  beforeEach(() => {
    module.clearHandlers();
    // Re-register handlers for testing
    import('./create');
  });

  it('should create booking', async () => {
    const handler = module.getHandler(Actions.booking.create);

    const result = await handler({
      input: { brandId: 'brand1', offeringId: 'offer1' },
      context: mockContext,
      makeError: mockMakeError,
      logger: mockLogger,
      cacheKey: mockCacheKey,
    });

    expect(result.data).toMatchObject({
      id: expect.any(String),
      status: 'PENDING',
    });
  });
});
```

## Best Practices

### 1. Action Naming

Use hierarchical dot notation:
- `domain.entity.operation`: `marketplace.booking.create`
- `domain.service.action`: `mail.notification.send`

### 2. Input Validation

Always use Zod schemas for comprehensive validation:

```typescript
const CreateBookingInput = z.object({
  brandId: z.string().uuid(),
  offeringId: z.string().uuid(),
  message: z.string().max(500).optional(),
  assetIds: z.string().array().min(1),
});
```

### 3. Error Handling

Use appropriate error types:
- `BAD_REQUEST`: Invalid input or business rule violation
- `NOT_FOUND`: Resource doesn't exist
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Permission denied
- `INTERNAL`: System errors

### 4. Context Management

Always thread context through action calls:

```typescript
// Good
const { data, context: updatedContext } = await callAction(action, {
  input,
  context: originalContext,
});

// Bad - losing context
const { data } = await callAction(action, { input, context: {} });
```

### 5. Cache Strategies

Use appropriate cache invalidation:

```typescript
// Invalidate by tags for related data
await cache.invalidateByTag(['marketplace', 'offerings']);

// Invalidate by owner for user-specific data
await cache.invalidateByTag([cacheKey.ownerTag]);

// Invalidate specific keys
await cache.invalidateByKey(`offering:${offeringId}`);
```

## Module Structure

Follow the standard module layout:

```
modules/domain/
├── __action__/          # Action definitions
│   ├── src/
│   │   ├── entity.ts
│   │   └── index.ts
│   └── package.json
├── __defs__/           # Type definitions
├── api/               # HTTP routes
├── module/            # Business logic
│   ├── src/
│   │   ├── actions/
│   │   │   └── entity/
│   │   │       ├── create.ts
│   │   │       └── update.ts
│   │   ├── logic/
│   │   └── _module.ts
│   └── package.json
└── __testing__/       # Tests
```

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Watch for changes
pnpm dev

# Type check
pnpm check-types

# Run tests
pnpm test
```

## Related Packages

- `@template/app-defs`: Core type definitions
- `@template/cache-utils`: Caching utilities
- `@template/error`: Error handling
- `@template/logging`: Structured logging
- `@template/redis`: Redis connection
