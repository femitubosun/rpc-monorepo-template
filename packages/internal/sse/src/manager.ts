import type { StreamingApi } from 'hono/utils/stream';
import { getRedis } from '@template/redis';
import { makeLogger } from '@template/logging';
import type { Redis } from 'ioredis';

const logger = makeLogger('SSE');

export interface SSEClient {
  id: string;
  stream: StreamingApi;
  tags: Set<string>;
  connectedAt: Date;
}

export interface SSEEvent {
  event: string;
  data: unknown;
  tag?: string;
}

export interface SSEManagerOptions {
  redisPubSub?: boolean;
  channel?: string;
}

/**
 * Shared SSE Manager for cross-module event streaming.
 *
 * Supports:
 * - Multiple endpoints per module
 * - Tag-based filtering (clients subscribe to specific tags)
 * - Redis pub/sub for multi-instance broadcasting
 * - Automatic cleanup on disconnect
 */
export class SSEManager {
  private clients = new Map<string, SSEClient>();
  private redis?: Redis;
  private subscriber?: Redis;
  private channel: string;
  private isRedisEnabled: boolean;

  constructor(options: SSEManagerOptions = {}) {
    this.channel = options.channel || 'sse:broadcast';
    this.isRedisEnabled = options.redisPubSub ?? true;

    if (this.isRedisEnabled) {
      this.#setupRedis();
    }
  }

  #setupRedis(): void {
    try {
      this.redis = getRedis();
      this.subscriber = this.redis.duplicate();

      this.subscriber.subscribe(this.channel, (err) => {
        if (err) {
          logger.error('Failed to subscribe to Redis channel', err);
          return;
        }
        logger.info(`Subscribed to Redis channel: ${this.channel}`);
      });

      this.subscriber.on('message', (_channel, message) => {
        try {
          const event: SSEEvent = JSON.parse(message);
          this.#localBroadcast(event);
        } catch (err) {
          logger.error('Failed to parse Redis message', err);
        }
      });
    } catch (err) {
      logger.warn('Redis not available, falling back to local-only mode', err);
      this.isRedisEnabled = false;
    }
  }

  /**
   * Register a new SSE client connection.
   */
  addClient(id: string, stream: StreamingApi, tags?: string[]): void {
    const client: SSEClient = {
      id,
      stream,
      tags: new Set(tags?.length ? tags : ['*']),
      connectedAt: new Date(),
    };

    this.clients.set(id, client);
    logger.info(`SSE client connected: ${id}`, { tags: Array.from(client.tags) });

    // Send initial connection event
    this.#sendToClient(client, {
      event: 'connected',
      data: { clientId: id, tags: Array.from(client.tags) },
    });
  }

  /**
   * Remove a client (called on disconnect).
   */
  removeClient(id: string): void {
    const existed = this.clients.delete(id);
    if (existed) {
      logger.info(`SSE client disconnected: ${id}`);
    }
  }

  /**
   * Broadcast an event to all connected clients.
   * If Redis is enabled, broadcasts across all server instances.
   */
  async broadcast(event: string, data: unknown, tag?: string): Promise<void> {
    const sseEvent: SSEEvent = { event, data, tag };

    if (this.isRedisEnabled && this.redis) {
      await this.redis.publish(this.channel, JSON.stringify(sseEvent));
    } else {
      this.#localBroadcast(sseEvent);
    }
  }

  /**
   * Send an event to a specific client by ID.
   */
  sendTo(clientId: string, event: string, data: unknown): boolean {
    const client = this.clients.get(clientId);
    if (!client) return false;

    this.#sendToClient(client, { event, data });
    return true;
  }

  /**
   * Get all connected clients (optionally filtered by tag).
   */
  getClients(tag?: string): SSEClient[] {
    const allClients = Array.from(this.clients.values());
    if (!tag) return allClients;
    return allClients.filter(
      (c) => c.tags.has('*') || c.tags.has(tag)
    );
  }

  /**
   * Get count of connected clients.
   */
  getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Local broadcast (within this process).
   */
  #localBroadcast(event: SSEEvent): void {
    const payload = this.#formatEvent(event);

    for (const [id, client] of this.clients) {
      if (!this.#shouldReceive(client, event)) continue;

      try {
        client.stream.write(payload);
      } catch (err) {
        logger.warn(`Failed to send to client ${id}, removing`, err);
        this.clients.delete(id);
      }
    }
  }

  /**
   * Send event to a specific client.
   */
  #sendToClient(client: SSEClient, event: SSEEvent): void {
    try {
      client.stream.write(this.#formatEvent(event));
    } catch (err) {
      logger.warn(`Failed to send to client ${client.id}, removing`, err);
      this.clients.delete(client.id);
    }
  }

  /**
   * Check if client should receive this event based on tags.
   */
  #shouldReceive(client: SSEClient, event: SSEEvent): boolean {
    // Client subscribed to all events
    if (client.tags.has('*')) return true;
    // Event has no tag, send to wildcard subscribers
    if (!event.tag) return client.tags.has('*');
    // Check if client subscribed to this specific tag
    return client.tags.has(event.tag);
  }

  /**
   * Format event as SSE wire format.
   */
  #formatEvent(event: SSEEvent): string {
    let output = `event: ${event.event}\n`;
    output += `data: ${JSON.stringify(event.data)}\n\n`;
    return output;
  }

  /**
   * Cleanup resources (call on server shutdown).
   */
  async dispose(): Promise<void> {
    if (this.subscriber) {
      await this.subscriber.unsubscribe(this.channel);
      this.subscriber.disconnect();
    }
    this.clients.clear();
    logger.info('SSE manager disposed');
  }
}

/**
 * Global SSE manager instance.
 *
 * Use this singleton for cross-module broadcasting.
 * Each module can create its own instance if isolation is needed.
 */
export const sseManager = new SSEManager();
