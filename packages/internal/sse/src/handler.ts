import type { Context } from 'hono';
import type { StreamingApi } from '@template/app-defs';
import { sseManager } from './manager';
import type { AppBindings } from '@template/router';

export interface SSEHandlerOptions {
  tags?: string[];
  heartbeatInterval?: number;
  onConnect?: (clientId: string) => void;
  onDisconnect?: (clientId: string) => void;
}

/**
 * Create an SSE handler for Hono.
 *
 * Usage:
 * ```ts
 * router.get('/events', createSSEHandler({ tags: ['notifications'] }));
 * ```
 */
export function createSSEHandler(options: SSEHandlerOptions = {}) {
  const {
    tags,
    heartbeatInterval = 30000,
    onConnect,
    onDisconnect,
  } = options;

  return async (c: Context<AppBindings>) => {
    const clientId = crypto.randomUUID();

    return c.stream(async (stream: StreamingApi) => {
      sseManager.addClient(clientId, stream, tags);
      onConnect?.(clientId);

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          stream.write(':heartbeat\n\n');
        } catch {
          clearInterval(heartbeat);
        }
      }, heartbeatInterval);

      // Wait until client disconnects
      try {
        await stream.closed;
      } finally {
        clearInterval(heartbeat);
        sseManager.removeClient(clientId);
        onDisconnect?.(clientId);
      }
    });
  };
}
