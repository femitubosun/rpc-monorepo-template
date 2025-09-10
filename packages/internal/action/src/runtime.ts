import Env from '@template/env';
import { makeError } from '@template/error';
import { makeLogger } from '@template/logging';
import type z from 'zod';
import type { ActionDef } from './__defs__';
import { CRON, type ExtractActionTypes } from './__defs__';
import { getWrapperHandler } from './helpers/handlers';
import type { Module, ModuleAction } from './module';
import type { Queue } from './queue';

const logger = makeLogger('AppRuntime');

class Runtime {
  public _appActions: Map<string, ModuleAction<ActionDef<z.ZodAny, z.ZodAny>>> =
    new Map();
  public _appCrons: Array<string> = [];
  public _queue?: Queue;

  init(modules: Array<Module<any>>, queue?: Queue) {
    this._appActions = new Map(modules.flatMap((m) => [...m._actions]));
    this._queue = queue;
    this._appCrons.push(...modules.flatMap((m) => m._crons));
  }

  async start() {
    if (!this._appActions.size) {
      logger.warn('No app actions or handlers found');

      return;
    }

    if (!this.#shouldStartQueue()) {
      logger.warn(
        `No Queue Connection OR In Test environment. Skipping Cron Creation....`
      );
      return;
    }

    await this.#cleanupRepeatableJobs();
    await this.startCrons();
  }

  async startCrons() {
    logger.log(`Starting crons`);
    this._appCrons.forEach(async (c) => {
      await this.#startCron(c);
    });
  }

  getHandler(name: string) {
    return this._appActions.get(name)?.handler;
  }

  getQueue() {
    return this._queue;
  }

  async scheduleJob<T extends ActionDef<any, any>>(
    action: T,
    input: {
      context: any;
      input: z.infer<ExtractActionTypes<T, 'input'>>;
      scheduledAt?: Date;
    }
  ): Promise<{ jobId: string; job: any }> {
    const queue = this.#validateQueue();
    if (!queue) {
      logger.warn(`Queue for scheduled job not found`);
      throw new Error('Queue not available');
    }

    const actionDef = this.#getValidAction(action.name);
    if (!actionDef) {
      logger.warn(`Action definition not found`);
      throw makeError({
        type: 'INTERNAL',
        message: `Action definition not found for ${action.name}`,
      });
    }

    const actionQueue = queue.getOrCreateQ(action.name);

    const wrappedHandler = getWrapperHandler(action.name, actionDef.handler!);

    queue.getOrCreateWorker(action.name, wrappedHandler, {
      connection: queue.redisConn!,
      concurrency: action._settings?.concurrency ?? 10,
    });

    const jobSettings: any = {};

    if (input.scheduledAt) {
      const delayMs = input.scheduledAt.getTime() - Date.now();
      if (delayMs <= 0) {
        throw new Error(
          `Scheduled time must be in the future. Provided: ${input.scheduledAt.toISOString()}`
        );
      }
      jobSettings.delay = delayMs;
    }

    if (action._settings?.jobRetry) {
      jobSettings.attempts = action._settings.jobRetry.attempts;
      if (action._settings.jobRetry.backoff) {
        jobSettings.backoff = {
          type: action._settings.jobRetry.backoff.type,
          delay: action._settings.jobRetry.backoff.delay,
        };
      }
    }

    const job = await actionQueue!.add(
      action.name,
      { context: input.context, input: input.input },
      jobSettings
    );

    return {
      jobId: job.id as string,
      job,
    };
  }

  async cancelScheduledJob(
    actionName: string,
    jobId: string
  ): Promise<boolean> {
    const queue = this.#validateQueue();
    if (!queue) {
      logger.warn(`Queue for cancel job not found`);
      return false;
    }

    return await queue.cancelJobById(actionName, jobId);
  }

  async #startCron(name: string) {
    logger.log(`Starting cron for ${name}`);

    const queue = this.#validateQueue();
    if (!queue) {
      logger.warn(`Queue not found`);
      return;
    }

    const action = this.#getValidCronAction(name);
    if (!action) {
      logger.warn(`Action not found`);
      return;
    }

    const actionQueue = queue.getOrCreateQ(name);
    const pattern = CRON[action.def._settings!.cron!];

    const wrappedHandler = getWrapperHandler(name, action.handler!);

    queue.getOrCreateWorker(name, wrappedHandler, {
      concurrency: action.def._settings?.concurrency ?? 10,
      connection: queue.redisConn!,
    });

    await actionQueue!.add(
      name,
      { context: {}, input: undefined },
      {
        repeat: {
          pattern,
        },
      }
    );

    logger.log(`Started cron ${name}: ${action.def._settings?.cron}`);
  }

  #shouldStartQueue() {
    return this._queue && Env.NODE_ENV !== 'testing';
  }

  #validateQueue() {
    if (!this._queue) {
      logger.warn('No queue. Cannot start cron');
      return null;
    }

    if (!this._queue.redisConn) {
      logger.warn('No connection. Cannot start cron');
      return null;
    }

    return this._queue!;
  }

  #getValidCronAction(name: string) {
    const action = this._appActions.get(name);

    if (!action) {
      logger.warn('Handler not found');
      return;
    }

    if (!action.def._settings?.cron) {
      logger.warn('Cannot find cron settings');

      return;
    }

    return action;
  }

  #getValidAction(name: string) {
    const action = this._appActions.get(name);

    if (!action) {
      logger.warn('Handler not found');
      return;
    }

    return action;
  }

  async #cleanupRepeatableJobs() {
    const queue = this.#validateQueue();
    if (!queue) {
      logger.warn('No queue available for cleanup');
      return;
    }

    logger.log('Cleaning up existing repeatable jobs before startup');

    try {
      await queue.cleanAllRepeatableJobsFromAllQueues();
      logger.log('Successfully cleaned up all existing repeatable jobs');
    } catch (error) {
      logger.error('Failed to clean up repeatable jobs', error);
    }
  }

  async shutdown() {
    logger.log('Starting graceful shutdown of action runtime...');

    try {
      if (this._queue) {
        logger.log('Closing queue connections...');
        await this._queue.clean();
        logger.log('Queue connections closed successfully');
      }

      this._appActions.clear();
      this._appCrons.length = 0;

      logger.log('Action runtime shutdown complete');
    } catch (error) {
      logger.error('Error during action runtime shutdown', error);
      throw error;
    }
  }
}

export const runtime = new Runtime();
