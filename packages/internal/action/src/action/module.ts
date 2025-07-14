/**
 *
 *
 *
 * A module needs to be able to register its actions.
 *
 */
import { preMakeActionError } from '@template/error';
import { makeLogger } from '@template/logging';
import { Worker } from 'bullmq';
import { connection } from '../connection';
import type {
  ActionGroup,
  ActionGroupHandler,
} from './__defs__';
import { getActionStructure } from './helpers/group';
import { actionRegistry } from './registry';

const moduleLogger = makeLogger('Module');

export class Module<T extends ActionGroup> {
  public _handlers: Partial<ActionGroupHandler<T>> = {};
  private _workers: Worker[] = [];
  private _isStarted = false;

  constructor(
    public name: string,
    public _actionGroup: T
  ) {}

  registerHandlers(config: Partial<ActionGroupHandler<T>>) {
    this._handlers = deepMerge(this._handlers, config);
  }

  _actionNames() {
    return getActionStructure(this._actionGroup);
  }

  _structure() {
    return mergeNameAndHandler(
      this._actionNames(),
      this._handlers
    );
  }

  getHandler(actionPath: any): any {
    const pathParts = this._getActionPath(actionPath);
    return this._getNestedHandler(
      this._handlers,
      pathParts
    );
  }

  private _getActionPath(actionPath: any): string[] {
    const structure = this._actionNames();
    return this._findActionPath(structure, actionPath, []);
  }

  private _findActionPath(
    structure: any,
    target: any,
    currentPath: string[]
  ): string[] {
    for (const key in structure) {
      const value = structure[key];

      if (value === target) {
        return [...currentPath, key];
      }

      if (typeof value === 'object' && value !== null) {
        const found = this._findActionPath(value, target, [
          ...currentPath,
          key,
        ]);
        if (found.length > 0) {
          return found;
        }
      }
    }
    return [];
  }

  private _getNestedHandler(
    handlers: any,
    pathParts: string[]
  ): any {
    let current = handlers;

    for (const part of pathParts) {
      if (
        current &&
        typeof current === 'object' &&
        part in current
      ) {
        current = current[part];
      } else {
        return undefined;
      }
    }

    return current;
  }

  _registerQueues() {
    const structure = this._structure();

    this._createWorkersFromStructure(structure);
  }

  async start() {
    if (this._isStarted) {
      moduleLogger.warn(
        `Module ${this.name} is already started`
      );
      return;
    }

    moduleLogger.info(`Starting module ${this.name}`);
    this._registerQueues();
    this._isStarted = true;
    moduleLogger.info(
      `Module ${this.name} started with ${this._workers.length} workers`
    );
  }

  async stop() {
    if (!this._isStarted) {
      moduleLogger.warn(
        `Module ${this.name} is not started`
      );
      return;
    }

    moduleLogger.info(`Stopping module ${this.name}`);

    await Promise.all(
      this._workers.map(async (worker) => {
        try {
          await worker.close();
        } catch (error) {
          moduleLogger.error(
            `Error closing worker: ${error}`
          );
        }
      })
    );

    this._workers = [];
    this._isStarted = false;
    moduleLogger.info(`Module ${this.name} stopped`);
  }

  private _createWorkersFromStructure(structure: any) {
    for (const key in structure) {
      const item = structure[key];

      if (item && typeof item === 'object') {
        if (item.name && typeof item.name === 'string') {
          const originalHandler =
            item.handler ||
            (async () => {
              moduleLogger.warn(
                `No handler for ${item.name}`
              );
              return { data: null, context: {} };
            });

          const wrappedHandler = async (job: any) => {
            const { context, input } = job.data;

            const logger = makeLogger(item.name);
            const makeError = preMakeActionError(item.name);

            return await originalHandler({
              makeError,
              input,
              context,
              logger,
            });
          };

          const worker = new Worker(
            item.name,
            wrappedHandler,
            { connection }
          );

          this._workers.push(worker);
          actionRegistry.registerWorker(item.name, worker);
        } else {
          this._createWorkersFromStructure(item);
        }
      }
    }
  }
}

function deepMerge(target: any, source: any): any {
  const result = { ...target };

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key])
    ) {
      if (
        result[key] &&
        typeof result[key] === 'object' &&
        !Array.isArray(result[key])
      ) {
        result[key] = deepMerge(result[key], source[key]);
      } else {
        result[key] = deepMerge({}, source[key]);
      }
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

function mergeNameAndHandler(
  names: Record<string, any>,
  handlers: Record<string, any>
): any {
  const result: Record<string, any> = {};

  for (const key of Object.keys(names)) {
    const nameVal = names[key];
    const handlerVal = handlers?.[key];

    if (typeof nameVal === 'string') {
      result[key] = {
        name: nameVal,
        handler:
          typeof handlerVal === 'function'
            ? handlerVal
            : undefined,
      };
    } else if (
      typeof nameVal === 'object' &&
      nameVal !== null
    ) {
      result[key] = mergeNameAndHandler(
        nameVal,
        handlerVal || {}
      );
    }
  }

  return result;
}
