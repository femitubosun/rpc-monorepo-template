import type { Context } from 'hono';
import { sseManager } from './manager';
import type { AppBindings } from '@template/router';

export interface SSEHandlerOptions {
  tags?: string[];
  heartbeatInterval?: number;
  onConnect?: (clientId: string) => void;
  onDisconnect?: (clientId: string) => void;
}

interface SSEStream {
  write(data: string): void;
}

/**
 * Create an SSE handler for Hono using standard Web Streams API.
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
    const encoder = new TextEncoder();

    let heartbeat: ReturnType<typeof setInterval>;

    const stream = new ReadableStream({
      start(controller) {
        const sseStream: SSEStream = {
          write(data: string) {
            controller.enqueue(encoder.encode(data));
          },
        };

        sseManager.addClient(clientId, sseStream, tags);
        onConnect?.(clientId);

        heartbeat = setInterval(() => {
          try {
            sseStream.write(':heartbeat\n\n');
          } catch {
            clearInterval(heartbeat);
          }
        }, heartbeatInterval);
      },
      cancel() {
        clearInterval(heartbeat);
        sseManager.removeClient(clientId);
        onDisconnect?.(clientId);
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  };
}
