# @axon-ai/action

A comprehensive action system providing type-safe, distributed job processing with support for synchronous execution, background jobs, and cron scheduling.

## Overview

The action system is built on two core artifacts:

- **Actions** (`A()`): Define the interface for individual actions with input/output schemas and settings
- **Modules**: Organize actions into groups and register their handlers

The system supports both synchronous execution for immediate results and asynchronous execution through a Redis-backed queue for background processing and cron jobs.

## Installation

```bash
pnpm add @axon-ai/action@workspace:*
```

## Core Concepts

### Defining Actions

Use the `A()` helper to define individual actions with type-safe schemas. **Important**: Related actions should share the same prefix in their names (e.g., `email.send`, `email.sendBulk`):

```typescript
import { A, z } from '@axon-ai/action';

// Basic action - note the naming convention with prefix
const sendEmail = A('email.send')
  .input(z.object({ 
    to: z.string().email(), 
    subject: z.string() 
  }))
  .output(z.object({ 
    messageId: z.string() 
  }));

// Action with settings - related actions share the same prefix
const processData = A('data.process')
  .input(z.object({ data: z.array(z.string()) }))
  .output(z.object({ processed: z.number() }))
  .settings({ 
    timeout: 30000, 
    concurrency: 5 
  });

// Cron job action - maintenance actions grouped by prefix
const cleanupFiles = A('maintenance.cleanup')
  .input(z.object({}))
  .output(z.object({ deletedCount: z.number() }))
  .settings({ 
    cron: 'every_day_at_midnight' 
  });
```

### Creating Action Groups

Use the `G()` helper to organize related actions:

```typescript
import { G } from '@axon-ai/action';

const emailActions = G({
  send: A('email.send')
    .input(z.object({ to: z.string(), subject: z.string() }))
    .output(z.object({ messageId: z.string() })),
    
  sendBulk: A('email.send-bulk')
    .input(z.object({ recipients: z.array(z.string()) }))
    .output(z.object({ sentCount: z.number() })),
});

// Nested groups
const userActions = G({
  auth: {
    login: A('user.auth.login')
      .input(z.object({ email: z.string(), password: z.string() }))
      .output(z.object({ token: z.string() })),
      
    logout: A('user.auth.logout')
      .input(z.object({}))
      .output(z.object({ success: z.boolean() })),
  },
  
  profile: {
    get: A('user.profile.get')
      .input(z.object({ userId: z.string() }))
      .output(z.object({ name: z.string(), email: z.string() })),
  }
});
```

### Creating Modules

Modules instantiate action groups and register their handlers. Use the `makeModule` helper function:

```typescript
import { makeModule } from '@axon-ai/action';

// Create module using makeModule (recommended approach)
const emailModule = makeModule('email', emailActions);

// Register handlers
emailModule.registerHandlers({
  send: async ({ input, context, logger }) => {
    logger.info('Sending email', { to: input.to });
    
    // Email sending logic here
    const messageId = await emailService.send(input);
    
    return { messageId };
  },
  
  sendBulk: async ({ input, context, logger }) => {
    logger.info('Sending bulk emails', { count: input.recipients.length });
    
    // Bulk email logic here
    const results = await emailService.sendBulk(input.recipients);
    
    return { sentCount: results.length };
  }
});
```

## Execution Modes

### Synchronous Execution

Use `callAction` for immediate execution and results:

```typescript
import { callAction } from '@axon-ai/action';

// Execute action and get result immediately
const result = await callAction(emailActions.send, {
  context: { userId: 'user-123' },
  input: { 
    to: 'user@example.com', 
    subject: 'Welcome!' 
  }
});

console.log(result.data.messageId); // "msg-abc123"
```

### Asynchronous Execution

Use `scheduleAction` for background job processing:

```typescript
import { scheduleAction } from '@axon-ai/action';

// Schedule action for background execution
await scheduleAction(emailActions.sendBulk, {
  context: { userId: 'admin-123' },
  input: { 
    recipients: ['user1@example.com', 'user2@example.com'] 
  }
});

// Returns immediately, job executes in background
```

## Runtime Setup

### Basic Setup (Sync Only)

For synchronous execution only:

```typescript
import { runtime } from '@axon-ai/action';

// Initialize runtime with modules
runtime.init([emailModule, userModule]);
```

### Full Setup (With Queue)

For background jobs and cron support:

```typescript
import { runtime, Queue } from '@axon-ai/action';
import { redis } from '@axon-ai/redis';

// Create queue with Redis connection
const queue = new Queue(redis);

// Initialize runtime with queue support
runtime.init([emailModule, userModule], queue);

// Start runtime (enables cron jobs)
await runtime.start();
```

## Handler Context

Action handlers receive a rich context object:

```typescript
emailModule.registerHandlers({
  send: async ({ input, context, logger, makeError, cacheKey }) => {
    // input: Type-safe action input
    // context: Request context (user, session, etc.)
    // logger: Action-specific logger
    // makeError: Error factory for consistent error handling
    // cacheKey: Cache key utilities
    
    try {
      const result = await emailService.send(input);
      logger.info('Email sent successfully', { messageId: result.messageId });
      return { messageId: result.messageId };
    } catch (error) {
      throw makeError({
        type: 'EXTERNAL',
        message: 'Failed to send email',
        cause: error
      });
    }
  }
});
```

## Cron Jobs

Actions can be scheduled as cron jobs:

```typescript
const maintenanceActions = G({
  cleanup: A('maintenance.cleanup')
    .input(z.object({}))
    .output(z.object({ deletedFiles: z.number() }))
    .settings({ 
      cron: 'every_day_at_midnight',
      concurrency: 1 
    }),
    
  backup: A('maintenance.backup')
    .input(z.object({}))
    .output(z.object({ backupId: z.string() }))
    .settings({ 
      cron: 'every_week',
      timeout: 600000 // 10 minutes
    })
});

const maintenanceModule = makeModule('maintenance', maintenanceActions);

maintenanceModule.registerHandlers({
  cleanup: async ({ logger }) => {
    logger.info('Starting file cleanup');
    const deletedFiles = await fileService.cleanup();
    return { deletedFiles };
  },
  
  backup: async ({ logger }) => {
    logger.info('Starting database backup');
    const backupId = await backupService.create();
    return { backupId };
  }
});

// Cron jobs start automatically when runtime starts with queue
runtime.init([maintenanceModule], queue);
await runtime.start();
```

## Available Cron Expressions

```typescript
import { CRON } from '@axon-ai/action';

const cronExpressions = {
  // Minutes
  every_minute: '* * * * *',
  every_five_minutes: '*/5 * * * *',
  every_ten_minutes: '*/10 * * * *',
  every_fifteen_minutes: '*/15 * * * *',
  every_thirty_minutes: '*/30 * * * *',
  
  // Hours
  every_hour: '0 * * * *',
  every_two_hours: '0 */2 * * *',
  every_six_hours: '0 */6 * * *',
  every_twelve_hours: '0 */12 * * *',
  
  // Daily
  every_day: '0 0 * * *',
  every_day_at_midnight: '0 0 * * *',
  every_day_at_noon: '0 12 * * *',
  every_day_at_6am: '0 6 * * *',
  
  // Weekly
  every_monday: '0 0 * * 1',
  every_friday: '0 0 * * 5',
  every_week: '0 0 * * 0',
  every_weekday: '0 0 * * 1-5',
  every_weekend: '0 0 * * 6,0',
  
  // Monthly/Yearly
  every_month: '0 0 1 * *',
  every_quarter: '0 0 1 */3 *',
  every_year: '0 0 1 1 *'
};
```

## Action Settings

Configure action behavior with settings:

```typescript
const heavyAction = A('heavy-processing')
  .input(z.object({ data: z.array(z.any()) }))
  .output(z.object({ result: z.string() }))
  .settings({
    validateInput: true,    // Validate input schema (default: true)
    validateOutput: true,   // Validate output schema (default: true)
    timeout: 300000,        // 5 minutes timeout (default: 300000)
    concurrency: 2,         // Max concurrent jobs (default: 500)
    cron: 'every_hour'      // Cron schedule (optional)
  });
```

## Transport Layers

The system supports different execution modes:

### Direct Execution
- Actions execute as regular function calls
- Immediate results
- No queue overhead
- Used by `callAction`

### Queue-based Execution
- Actions execute through Redis/BullMQ
- Background processing
- Supports cron scheduling
- Used by `scheduleAction` and cron jobs

### Future: Configurable Transport
- Pluggable transport layers planned
- Support for different queue systems
- Distributed execution across services

## Error Handling

Consistent error handling across the system:

```typescript
userModule.registerHandlers({
  authenticate: async ({ input, makeError }) => {
    const user = await userService.findByEmail(input.email);
    
    if (!user) {
      throw makeError({
        type: 'NOT_FOUND',
        message: 'User not found',
        data: { email: input.email }
      });
    }
    
    if (!user.active) {
      throw makeError({
        type: 'FORBIDDEN',
        message: 'User account is disabled'
      });
    }
    
    return { userId: user.id, token: generateToken(user) };
  }
});
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

## API Reference

### Core Functions
- `A(name: string)`: Create action definition
- `G(group: ActionGroup)`: Create action group
- `makeModule(name, group)`: Create action module (recommended)
- `callAction(action, input)`: Execute action synchronously
- `scheduleAction(action, input)`: Execute action asynchronously

### Classes
- `Module<T>`: Action module container (use `makeModule` instead)
- `Queue`: Job queue management
- `runtime`: Global runtime instance

### Types
- `ActionDef<Input, Output>`: Action definition type
- `ActionGroup`: Nested action group type
- `QSettings`: Action configuration settings
- `CronExpression`: Available cron schedule types