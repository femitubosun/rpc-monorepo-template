# @template/sse

Shared SSE (Server-Sent Events) manager for cross-module real-time broadcasting.

Supports:
- Multiple SSE endpoints across different modules
- Tag-based event filtering (clients subscribe to specific tags)
- Redis pub/sub for multi-instance broadcasting
- Automatic client cleanup on disconnect
- Heartbeat keepalive

## Installation

This package is available as a workspace dependency. Add it to your module's `package.json`:

```json
{
  "dependencies": {
    "@template/sse": "workspace:*"
  }
}
```

## Quick Start

### 1. Create an SSE endpoint in your module

```typescript
// modules/notifications/api/src/router/index.ts
import { Route } from '@template/router';
import { createSSEHandler } from '@template/sse';

export const _router = {
  // Regular REST routes
  list: Route.get('/notifications')
    .jsonResponse(200, 'List notifications', NotificationListSchema)
    .build(),
} as const;

// modules/notifications/api/src/index.ts
import { type AppOpenAPI, CreateAppRouter, Module } from '@template/router';
import { createSSEHandler } from '@template/sse';
import { _handlers } from './handlers';
import { _router } from './router';

export function router(): AppOpenAPI {
  const router = CreateAppRouter();

  // Register OpenAPI routes
  Module.registerRoutes(router, _router, _handlers);

  // Register SSE endpoint (not OpenAPI-documented)
  router.get('/notifications/events', createSSEHandler({
    tags: ['notifications'],
    heartbeatInterval: 30000,
    onConnect: (clientId) => {
      console.log(`Client ${clientId} subscribed to notifications`);
    },
    onDisconnect: (clientId) => {
      console.log(`Client ${clientId} unsubscribed from notifications`);
    },
  }));

  return router;
}

export default router();
```

### 2. Broadcast events from your module

```typescript
// modules/notifications/api/src/handlers/create.ts
import { sseManager } from '@template/sse';

export async function createNotification(data: CreateNotificationInput) {
  const notification = await db.notification.create({ data });

  // Broadcast to all clients subscribed to 'notifications' tag
  await sseManager.broadcast('notification:created', notification, 'notifications');

  return notification;
}
```

### 3. Client-side usage

```javascript
// Client subscribes to notifications
const eventSource = new EventSource('/api/v1/notifications/events');

eventSource.addEventListener('connected', (e) => {
  const { clientId, tags } = JSON.parse(e.data);
  console.log('Connected with ID:', clientId);
});

eventSource.addEventListener('notification:created', (e) => {
  const notification = JSON.parse(e.data);
  console.log('New notification:', notification);
});

eventSource.onerror = (err) => {
  console.error('SSE error:', err);
};
```

## Multiple Modules with SSE

Each module can have its own SSE endpoint. Clients connect to whichever endpoints they need:

```typescript
// modules/chat/api/src/index.ts
router.get('/chat/events', createSSEHandler({
  tags: ['chat'],
}));

// modules/notifications/api/src/index.ts
router.get('/notifications/events', createSSEHandler({
  tags: ['notifications'],
}));

// Client connects to both:
const chatSSE = new EventSource('/api/v1/chat/events');
const notifSSE = new EventSource('/api/v1/notifications/events');
```

Or use a single shared endpoint with tag filtering:

```typescript
// modules/sse/api/src/index.ts (dedicated SSE module)
router.get('/events', createSSEHandler()); // No tags = receives all events

// Client filters by tags via query param
const eventSource = new EventSource('/api/v1/events?tags=chat,notifications');
```

## Advanced Usage

### Custom SSE Manager Instance

If you need isolation (e.g., different Redis channels):

```typescript
import { SSEManager } from '@template/sse';

const isolatedManager = new SSEManager({
  redisPubSub: true,
  channel: 'sse:isolated',
});

// Use isolatedManager instead of sseManager
```

### Send to Specific Client

```typescript
import { sseManager } from '@template/sse';

// Send to a specific client by ID
sseManager.sendTo(clientId, 'direct:message', { text: 'Hello!' });
```

### Get Connected Clients

```typescript
// All clients
const allClients = sseManager.getClients();

// Clients subscribed to a specific tag
const chatClients = sseManager.getClients('chat');
```

### Cleanup on Shutdown

```typescript
import { sseManager } from '@template/sse';

process.on('SIGTERM', async () => {
  await sseManager.dispose();
  process.exit(0);
});
```

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   API Instance 1 │     │   API Instance 2 │
│  ┌───────────┐  │     │  ┌───────────┐  │
│  │ SSEManager │  │◄────►│  │ SSEManager │  │
│  └─────┬─────┘  │ Redis │  └─────┬─────┘  │
│        │        │ Pub/Sub       │        │
│   ┌────┴────┐   │     │   ┌────┴────┐   │
│   │ Clients │   │     │   │ Clients │   │
│   └─────────┘   │     │   └─────────┘   │
└─────────────────┘     └─────────────────┘
```

## API Reference

### `sseManager`

Global singleton instance of `SSEManager`.

### `SSEManager`

#### Constructor

```typescript
new SSEManager(options?: SSEManagerOptions)
```

Options:
- `redisPubSub?: boolean` - Enable Redis pub/sub (default: `true`)
- `channel?: string` - Redis channel name (default: `'sse:broadcast'`)

#### Methods

- `addClient(id: string, stream: StreamingApi, tags?: string[]): void`
- `removeClient(id: string): void`
- `broadcast(event: string, data: unknown, tag?: string): Promise<void>`
- `sendTo(clientId: string, event: string, data: unknown): boolean`
- `getClients(tag?: string): SSEClient[]`
- `getClientCount(): number`
- `dispose(): Promise<void>`

### `createSSEHandler(options?)`

Helper to create a Hono handler for SSE endpoints.

Options:
- `tags?: string[]` - Tags this endpoint subscribes to
- `heartbeatInterval?: number` - Heartbeat interval in ms (default: `30000`)
- `onConnect?: (clientId: string) => void`
- `onDisconnect?: (clientId: string) => void`
