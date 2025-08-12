import Env from '@template/env';
import { makeLogger } from '@template/logging';
import type z from 'zod';
import type { ActionDef } from './__defs__';
import { CRON, type ExtractActionTypes } from './__defs__';
import { getWrapperHandler } from './helpers/handlers';
import type { Module, ModuleAction } from './module';
import type { Queue } from './queue';

const logger = makeLogger('AppRuntime');

class Runtime {
  public _appActions: Map<
    string,
    ModuleAction<ActionDef<z.ZodAny, z.ZodAny>>
  > = new Map();
  public _appCrons: Array<string> = [];
  public _queue?: Queue;

  init(modules: Array<Module<any>>, queue?: Queue) {
    this._appActions = new Map(
      modules.flatMap((m) => [...m._actions])
    );
    this._queue = queue;
    this._appCrons.push(
      ...modules.flatMap((m) => m._crons)
    );
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

  async scheduleJob<T extends ActionDef<any, any>>(
    action: T,
    input: {
      context: any;
      input: z.infer<ExtractActionTypes<T, 'input'>>;
    }
  ) {
    const queue = this.#validateQueue();
    if (!queue) {
      logger.warn(`Queue for scheduled job not found`);
      return;
    }

    const actionDef = this.#getValidAction(action.name);
    if (!actionDef) {
      logger.warn(`Action definition not found`);
      return;
    }

    const actionQueue = queue.getOrCreateQ(action.name);

    const wrappedHandler = getWrapperHandler(
      action.name,
      actionDef.handler!
    );

    queue.getOrCreateWorker(action.name, wrappedHandler, {
      connection: queue.redisConn!,
      concurrency: action._settings?.concurrency ?? 10,
    });

    await actionQueue!.add(action.name, input);
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

    queue.getOrCreateWorker(name, action.handler!, {
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

    logger.log(
      `Started cron ${name}: ${action.def._settings?.cron}`
    );
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
}

export const runtime = new Runtime();
