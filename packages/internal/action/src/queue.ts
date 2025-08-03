import { makeLogger } from '@axon-ai/logging';
import type { Redis } from '@axon-ai/redis';
import {
  Queue as BullQ,
  type JobsOptions,
  QueueEvents,
  Worker,
  type WorkerOptions,
} from 'bullmq';

export class Queue {
  private _queues = new Map<string, BullQ>();
  private _workers = new Map<string, Worker>();
  private _events = new Map<string, QueueEvents>();
  #logger = makeLogger('AppQueue');

  constructor(public redisConn: Redis) {}

  async scheduleJob(q: string, data: string, settings?: JobsOptions) {
    const queue = this.getOrCreateQ(q);

    return await queue.add(q, data, settings);
  }

  async executeJob(q: string, data: string, settings?: JobsOptions) {
    const job = this.scheduleJob(q, data, settings);
    const qEvents = this.getOrCreateQEvents(q);

    return (await job).waitUntilFinished(qEvents);
  }

  getOrCreateQ(name: string) {
    const q = this._queues.get(name);

    if (q) return q;

    const newQ = new BullQ(name);
    this._queues.set(name, newQ);

    return newQ;
  }

  getOrCreateWorker(
    name: string,
    workerFn: Function,
    settings?: WorkerOptions
  ) {
    const worker = this._workers.get(name);

    if (worker) return worker;

    const wrappedFn = async (job: any) => workerFn(job.data);
    const newWorker = this.createWorker(name, wrappedFn, settings);
    this._workers.set(name, newWorker);

    return newWorker;
  }

  createWorker(
    name: string,
    workerFn: (job: unknown) => Promise<any>,
    settings?: WorkerOptions
  ) {
    return new Worker(name, workerFn, settings);
  }

  getOrCreateQEvents(name: string, conn?: Redis) {
    const qEvents = this._events.get(name);

    if (qEvents) return qEvents;

    const newQEvents = new QueueEvents(name, {
      connection: conn ?? this.redisConn,
    });

    newQEvents.setMaxListeners(100);
    this.#attachEventHandlers(newQEvents, name);

    this._events.set(name, newQEvents);

    return newQEvents;
  }

  #attachEventHandlers(qEvent: QueueEvents, name: string) {
    qEvent.on('error', this.#getErrorEventHandler(name));
  }

  #getErrorEventHandler(name: string) {
    return (error: any) =>
      this.#logger.error(`Queue Event Error  for ${name}`, error);
  }

  async clean() {
    await Promise.allSettled([
      this.#cleanQueues(),
      this.#cleanWorkers(),
      this.#cleanEvents(),
    ]);

    this._queues.clear();
    this._workers.clear();
    this._events.clear();
  }

  async #cleanQueues() {
    const cleanupPromises: Promise<void>[] = [];

    for (const [name, queue] of this._queues) {
      cleanupPromises.push(
        queue
          .close()
          .catch((error) =>
            this.#logger.error(`Error closing queue ${name}`, error)
          )
      );
    }

    await Promise.allSettled(cleanupPromises);
  }

  async #cleanWorkers() {
    const cleanupPromises: Promise<void>[] = [];

    for (const [name, queue] of this._workers) {
      cleanupPromises.push(
        queue
          .close()
          .catch((error) =>
            this.#logger.error(`Error closing workers ${name}`, error)
          )
      );
    }

    await Promise.allSettled(cleanupPromises);
  }

  async #cleanEvents() {
    const cleanupPromises: Promise<void>[] = [];

    for (const [name, queue] of this._events) {
      cleanupPromises.push(
        queue
          .close()
          .catch((error) =>
            this.#logger.error(`Error closing events ${name}`, error)
          )
      );
    }

    await Promise.allSettled(cleanupPromises);
  }
}
