import { makeLogger } from '@template/logging';
import type { Redis } from '@template/redis';
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

  async cancelJobById(queueName: string, jobId: string): Promise<boolean> {
    try {
      const queue = this.getOrCreateQ(queueName);
      const job = await queue.getJob(jobId);

      if (!job) {
        this.#logger.warn(`Job ${jobId} not found in queue ${queueName}`);
        return false;
      }

      if ((await job.isActive()) || (await job.isCompleted())) {
        this.#logger.warn(`Cannot cancel job ${jobId} - already processed`);
        return false;
      }

      await job.remove();
      this.#logger.info(
        `Successfully cancelled job ${jobId} from queue ${queueName}`
      );
      return true;
    } catch (error) {
      this.#logger.error(`Error cancelling job ${jobId}`, error);
      return false;
    }
  }

  getOrCreateQ(name: string) {
    const q = this._queues.get(name);

    if (q) return q;

    const newQ = new BullQ(name, {
      connection: this.redisConn,
    });
    this._queues.set(name, newQ);

    return newQ;
  }

  async getOrCreateWorker(
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

  async cleanAllRepeatableJobs() {
    const cleanupPromises: Promise<void>[] = [];

    for (const [name, queue] of this._queues) {
      cleanupPromises.push(this.#cleanRepeatableJobs(queue, name));
    }

    await Promise.allSettled(cleanupPromises);
    this.#logger.info('Cleaned all repeatable jobs from all queues');
  }

  async cleanAllRepeatableJobsFromAllQueues() {
    const allQueueNames = await this.#discoverAllBullMQQueues();

    this.#logger.info(`Found ${allQueueNames.length} BullMQ queues in Redis`);

    const cleanupPromises = allQueueNames.map(async (queueName: string) => {
      const queue = new BullQ(queueName, {
        connection: this.redisConn,
      });

      try {
        const repeatableJobs = await queue.getRepeatableJobs();

        if (repeatableJobs.length === 0) {
          return;
        }

        this.#logger.info(
          `Found ${repeatableJobs.length} repeatable jobs in queue ${queueName}`
        );

        const removePromises = repeatableJobs.map(async (job) => {
          try {
            await queue.removeRepeatableByKey(job.key);
            this.#logger.debug(
              `Removed repeatable job ${job.key} from queue ${queueName}`
            );
          } catch (error) {
            this.#logger.error(
              `Failed to remove repeatable job ${job.key} from queue ${queueName}`,
              error
            );
          }
        });

        await Promise.allSettled(removePromises);
        this.#logger.info(
          `Cleaned ${repeatableJobs.length} repeatable jobs from queue ${queueName}`
        );
      } catch (error) {
        this.#logger.error(
          `Error cleaning repeatable jobs from queue ${queueName}`,
          error
        );
      } finally {
        await queue.close();
      }
    });

    await Promise.allSettled(cleanupPromises);
    this.#logger.info('Cleaned all repeatable jobs from all discovered queues');
  }

  async #discoverAllBullMQQueues(): Promise<string[]> {
    const knownQueues = new Set<string>();

    try {
      const knownQueuesFromSet =
        await this.redisConn.smembers('bull:known_queues');
      knownQueuesFromSet.forEach((name) => {
        knownQueues.add(name);
      });
      this.#logger.debug(
        `Found ${knownQueuesFromSet.length} queues from known_queues set`
      );
    } catch (error) {
      this.#logger.debug('Could not retrieve known_queues set', error);
    }

    try {
      const bullKeys = await this.redisConn.keys('bull:*');

      const queueNames = bullKeys
        .filter(
          (key) =>
            key.includes(':') &&
            !key.includes(':jobs:') &&
            !key.includes(':events:')
        )
        .map((key) => {
          const parts = key.split(':');
          if (parts.length >= 2) {
            return parts[1];
          }
          return null;
        })
        .filter((name): name is string => name !== null && name.length > 0)
        .filter(
          (name) =>
            !name.includes('completed') &&
            !name.includes('failed') &&
            !name.includes('active')
        );

      queueNames.forEach((name) => {
        knownQueues.add(name);
      });
      this.#logger.debug(
        `Found ${queueNames.length} additional queues from Redis key scan`
      );
    } catch (error) {
      this.#logger.error('Error scanning Redis for BullMQ queues', error);
    }

    const allQueueNames = Array.from(knownQueues).filter(
      (name) => name.trim().length > 0
    );
    return allQueueNames;
  }

  async #cleanRepeatableJobs(queue: BullQ, queueName: string) {
    try {
      const repeatableJobs = await queue.getRepeatableJobs();

      if (repeatableJobs.length === 0) {
        return;
      }

      this.#logger.info(
        `Found ${repeatableJobs.length} repeatable jobs in queue ${queueName}`
      );

      const removePromises = repeatableJobs.map(async (job) => {
        try {
          await queue.removeRepeatableByKey(job.key);
          this.#logger.debug(
            `Removed repeatable job ${job.key} from queue ${queueName}`
          );
        } catch (error) {
          this.#logger.error(
            `Failed to remove repeatable job ${job.key} from queue ${queueName}`,
            error
          );
        }
      });

      await Promise.allSettled(removePromises);
      this.#logger.info(
        `Cleaned ${repeatableJobs.length} repeatable jobs from queue ${queueName}`
      );
    } catch (error) {
      this.#logger.error(
        `Error cleaning repeatable jobs from queue ${queueName}`,
        error
      );
    }
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
