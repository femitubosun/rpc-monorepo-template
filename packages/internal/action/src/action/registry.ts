import type { Logger } from '@template/app-defs';
import { AppError } from '@template/error';
import { makeLogger } from '@template/logging';
import {
  type Job,
  Queue,
  QueueEvents,
  type Worker,
} from 'bullmq';
import { connection } from '../connection';
import {
  type PendingJob,
  QueueConnectionError,
} from './__defs__';

const logger = makeLogger('ActionRegistry');

class ActionRegistry {
  #queues = new Map<string, Queue>();
  #workers = new Map<string, Worker>();
  #queueEvents = new Map<string, QueueEvents>();
  public pendingJobs = new Map<string, PendingJob>();
  #defaultExecuteTimeout = 30000; // 30 seconds

  registerQueue(action: string, queue: Queue) {
    this.#queues.set(action, queue);
  }

  registerWorker(action: string, worker: Worker) {
    this.#workers.set(action, worker);
  }

  getQueue(action: string): Queue | undefined {
    return this.#queues.get(action);
  }

  getWorker(action: string): Worker | undefined {
    return this.#workers.get(action);
  }

  async addJob(action: string, data: any): Promise<Job> {
    try {
      const queue = this.#getOrCreateQueue(action);
      const job = await queue.add(action, data);

      this.pendingJobs.set(job.id!, {
        type: 'background-job',
        logger: makeLogger(action.toUpperCase()),
        action,
        data,
      });

      return job;
    } catch (error) {
      logger.error(
        `Failed to add job to queue ${action}`,
        error
      );
      throw new QueueConnectionError(
        action,
        error as Error
      );
    }
  }

  async callJob(action: string, data: any): Promise<any> {
    const queue = this.#getOrCreateQueue(action);
    this.#getOrCreateQueueEvents(action);

    const job = await queue.add(action, data, {
      removeOnComplete: true,
      priority: 0,
    });

    return new Promise((resolve, reject) => {
      const handleTimeout = setTimeout(() => {
        this.pendingJobs.delete(job.id!);
        job.remove().catch(() => {});
        reject(
          new AppError({
            type: 'INTERNAL',
            message: `Timeout exceeded for job ${job.id}`,
            action,
          })
        );
      }, this.#defaultExecuteTimeout);

      this.pendingJobs.set(job.id!, {
        resolve,
        reject,
        handleTimeout,
        action,
        logger: makeLogger(action.toUpperCase()),
        type: 'action',
        data,
      });
    });
  }

  #getOrCreateQueue(action: string): Queue {
    let queue = this.getQueue(action);
    if (!queue) {
      queue = new Queue(action, {
        connection,
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 1,
        },
      });
      this.registerQueue(action, queue);
    }
    return queue;
  }

  #getOrCreateQueueEvents(action: string): QueueEvents {
    let queueEvents = this.#queueEvents.get(action);
    if (!queueEvents) {
      queueEvents = new QueueEvents(action, {
        connection,
      });
      queueEvents.setMaxListeners(100);
      this.#queueEvents.set(action, queueEvents);

      queueEvents.on('error', (error) => {
        logger.error(
          `QueueEvents error for ${action}`,
          error
        );
      });
      ``;

      queueEvents.on(
        'completed',
        this.#handleJobCompleted.bind(this)
      );
      queueEvents.on(
        'failed',
        this.#handleJobFailed.bind(this)
      );
    }
    return queueEvents;
  }

  #handleJobCompleted({
    jobId,
    returnvalue,
  }: {
    jobId: string;
    returnvalue: any;
  }) {
    const pendingJob = this.pendingJobs.get(jobId);

    if (!pendingJob) {
      return;
    }

    if (pendingJob.type === 'action') {
      clearTimeout(pendingJob.handleTimeout);
      try {
        pendingJob.resolve(JSON.parse(returnvalue));
      } catch {
        pendingJob.resolve(returnvalue);
      }
    }

    this.pendingJobs.delete(jobId);
  }

  #handleJobFailed({
    jobId,
    failedReason,
  }: {
    jobId: string;
    failedReason: string;
  }) {
    const pendingJob = this.pendingJobs.get(jobId);

    if (!pendingJob) {
      return;
    }
    this.#cleanFailedJob(jobId, pendingJob);

    const error = this.#createErrorFromFailedJob(
      failedReason,
      pendingJob
    );
    this.#logJobFailure(jobId, error, pendingJob.logger);

    this.#rejectJobIfAction(pendingJob, error);
  }

  #cleanFailedJob(jobId: string, pendingJob: PendingJob) {
    if (pendingJob.type === 'action') {
      clearTimeout(pendingJob.handleTimeout);
    }
    this.pendingJobs.delete(jobId);
  }

  #createErrorFromFailedJob(
    failedReason: string,
    pendingJob: PendingJob
  ) {
    try {
      const error =
        AppError.fromActionFailReason(failedReason);
      error.data = pendingJob.data;

      return error;
    } catch {
      return new AppError({
        message: failedReason,
        action: pendingJob.action,
        type: 'INTERNAL',
        data: pendingJob.data,
      });
    }
  }

  #logJobFailure(
    jobId: string,
    error: AppError,
    logger: Logger
  ) {
    logger.error(`Job: ${jobId} failed with reason`, error);
  }

  #rejectJobIfAction(
    pendingJob: PendingJob,
    error: AppError
  ) {
    if (pendingJob.type === 'action') {
      pendingJob.reject(error);
    }
  }

  async cleanup(): Promise<void> {
    const cleanupPromises: Promise<void>[] = [];

    for (const [name, queue] of this.#queues) {
      cleanupPromises.push(
        queue
          .close()
          .catch((error) =>
            logger.error(
              `Error closing queue ${name}`,
              error
            )
          )
      );
    }

    for (const [name, worker] of this.#workers) {
      cleanupPromises.push(
        worker
          .close()
          .catch((error) =>
            logger.error(
              `Error closing worker ${name}`,
              error
            )
          )
      );
    }

    for (const [name, queueEvents] of this.#queueEvents) {
      cleanupPromises.push(
        queueEvents
          .close()
          .catch((error) =>
            logger.error(
              `Error closing queue events ${name}`,
              error
            )
          )
      );
    }

    await Promise.allSettled(cleanupPromises);

    this.#queues.clear();
    this.#workers.clear();
    this.#queueEvents.clear();
  }
}

export const actionRegistry = new ActionRegistry();

process.on('SIGINT', async () => {
  logger.info('Received SIGINT, cleaning up...');
  await actionRegistry.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, cleaning up...');
  await actionRegistry.cleanup();
  process.exit(0);
});
