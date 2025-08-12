// /**
//  *
//  *
//  *
//  * A module needs to be able to register its actions.
//  *
//  */
// import { ActionCacheKey } from '@template/cache-utils';
// import Env from '@template/env';
// import { preMakeAsyncActionError } from '@template/error';
// import { makeLogger } from '@template/logging';
// import { Worker } from 'bullmq';
// import { connection } from '../connection';
// import type {
//   ActionGroup,
//   ActionGroupHandler,
//   ExtractActionHandler,
// } from './__defs__';
// import type { ActionDef } from './action-def';
// import { registerModule } from './action-system';
// import {
//   getActionStructure,
//   getActions,
// } from './helpers/group';
// import {
//   getActionSettings,
//   registerActionSettings,
//   registerWorker,
//   scheduleJob,
// } from './queues';

// const moduleLogger = makeLogger('Module');

// export class Module<T extends ActionGroup> {
//   public _handlers: Partial<ActionGroupHandler<T>> = {};
//   private _workers: Worker[] = [];
//   private _isStarted = false;
//   private _workerCache = new Map<string, Worker>();

//   constructor(
//     public name: string,
//     public _actionGroup: T
//   ) {}

//   registerHandlers(config: Partial<ActionGroupHandler<T>>) {
//     this._handlers = deepMerge(this._handlers, config);
//   }

//   _actionNames() {
//     return getActionStructure(this._actionGroup);
//   }

//   _structure() {
//     return mergeNameAndHandler(
//       this._actionNames(),
//       this._handlers
//     );
//   }

//   getHandler<A extends ActionDef<any, any>>(
//     actionPath: A
//   ): ExtractActionHandler<T, A> | undefined {
//     const pathParts = this._getActionPath(actionPath);
//     return this._getNestedHandler(
//       this._handlers,
//       pathParts
//     ) as ExtractActionHandler<T, A> | undefined;
//   }

//   private _getActionPath(actionPath: any): string[] {
//     const structure = this._actionNames();
//     return this._findActionPath(structure, actionPath, []);
//   }

//   private _findActionPath(
//     structure: any,
//     target: any,
//     currentPath: string[]
//   ): string[] {
//     for (const key in structure) {
//       const value = structure[key];

//       // Compare with target.name if target is an ActionDef, otherwise direct comparison
//       const targetValue =
//         target &&
//         typeof target === 'object' &&
//         'name' in target
//           ? target.name
//           : target;
//       if (value === targetValue) {
//         return [...currentPath, key];
//       }

//       if (typeof value === 'object' && value !== null) {
//         const found = this._findActionPath(value, target, [
//           ...currentPath,
//           key,
//         ]);
//         if (found.length > 0) {
//           return found;
//         }
//       }
//     }
//     return [];
//   }

//   private _getNestedHandler(
//     handlers: any,
//     pathParts: string[]
//   ): any {
//     let current = handlers;

//     for (const part of pathParts) {
//       if (
//         current &&
//         typeof current === 'object' &&
//         part in current
//       ) {
//         current = current[part];
//       } else {
//         return undefined;
//       }
//     }

//     return current;
//   }

//   getOrCreateWorker(
//     actionName: string
//   ): Worker | undefined {
//     let worker = this._workerCache.get(actionName);

//     if (!worker) {
//       const structure = this._structure();
//       const handlerInfo = this._findHandlerInStructure(
//         structure,
//         actionName
//       );

//       if (handlerInfo) {
//         worker = this._createWorkerForAction(
//           actionName,
//           handlerInfo.handler
//         );
//         this._workerCache.set(actionName, worker);
//         this._workers.push(worker);
//         registerWorker(actionName, worker);
//       }
//     }

//     return worker;
//   }

//   private _findHandlerInStructure(
//     structure: any,
//     targetAction: string
//   ): any {
//     for (const key in structure) {
//       const item = structure[key];

//       if (item && typeof item === 'object') {
//         if (item.name === targetAction && item.handler) {
//           return item;
//         } else if (!item.name) {
//           const found = this._findHandlerInStructure(
//             item,
//             targetAction
//           );
//           if (found) return found;
//         }
//       }
//     }
//     return null;
//   }

//   async start() {
//     // if (Env.NODE_ENV === 'testing') {
//     //   // Do not start workers for test
//     //   return;
//     // }

//     if (this._isStarted) {
//       moduleLogger.warn(
//         `Module ${this.name} is already started`
//       );
//       return;
//     }

//     moduleLogger.info(`Starting module ${this.name}`);

//     this._registerActionSettings();

//     if (Env.NODE_ENV !== 'testing') {
//       await this._createAllWorkers();
//     }

//     registerModule(this);

//     this._isStarted = true;
//     moduleLogger.info(
//       `Module ${this.name} started (all workers created at startup)`
//     );
//   }

//   private _registerActionSettings() {
//     const actions = getActions(this._actionGroup);
//     for (const action of actions) {
//       if (action._settings) {
//         registerActionSettings(
//           action.name,
//           action._settings
//         );
//       }
//     }
//   }

//   private async _createAllWorkers() {
//     const actions = getActions(this._actionGroup);
//     for (const action of actions) {
//       // moduleLogger.info(
//       //   `Creating worker for action: ${action.name}`
//       // );

//       this.getOrCreateWorker(action.name);

//       if (action._settings?.cron) {
//         try {
//           await scheduleJob(action.name, {});
//           // moduleLogger.info(
//           //   `Scheduled cron job for ${action.name} with pattern: ${action._settings.cron}`,
//           // );
//         } catch (error) {
//           moduleLogger.error(
//             `Failed to schedule cron job for ${action.name}:`,
//             error
//           );
//         }
//       }
//     }
//   }

//   async stop() {
//     if (!this._isStarted) {
//       moduleLogger.warn(
//         `Module ${this.name} is not started`
//       );
//       return;
//     }

//     moduleLogger.info(`Stopping module ${this.name}`);

//     await Promise.all(
//       this._workers.map(async (worker) => {
//         try {
//           await worker.close();
//         } catch (error) {
//           moduleLogger.error(
//             `Error closing worker: ${error}`
//           );
//         }
//       })
//     );

//     this._workers = [];
//     this._workerCache.clear();
//     this._isStarted = false;
//     moduleLogger.info(`Module ${this.name} stopped`);
//   }

//   private _createWorkerForAction(
//     actionName: string,
//     originalHandler: any
//   ): Worker {
//     const wrappedHandler = async (job: any) => {
//       const { context, input } = job.data;

//       const logger = makeLogger(actionName.toUpperCase());
//       const makeError = preMakeAsyncActionError(actionName);
//       const cacheKey = new ActionCacheKey(actionName);

//       return await originalHandler({
//         makeError,
//         input,
//         context,
//         logger,
//         cacheKey,
//       });
//     };

//     const settings = getActionSettings(actionName);
//     return new Worker(actionName, wrappedHandler, {
//       connection,
//       concurrency: settings.concurrency,
//     });
//   }
// }

// function deepMerge(target: any, source: any): any {
//   const result = { ...target };

//   for (const key in source) {
//     if (
//       source[key] &&
//       typeof source[key] === 'object' &&
//       !Array.isArray(source[key])
//     ) {
//       if (
//         result[key] &&
//         typeof result[key] === 'object' &&
//         !Array.isArray(result[key])
//       ) {
//         result[key] = deepMerge(result[key], source[key]);
//       } else {
//         result[key] = deepMerge({}, source[key]);
//       }
//     } else {
//       result[key] = source[key];
//     }
//   }

//   return result;
// }

// function mergeNameAndHandler(
//   names: Record<string, any>,
//   handlers: Record<string, any>
// ): any {
//   const result: Record<string, any> = {};

//   for (const key of Object.keys(names)) {
//     const nameVal = names[key];
//     const handlerVal = handlers?.[key];

//     if (typeof nameVal === 'string') {
//       result[key] = {
//         name: nameVal,
//         handler:
//           typeof handlerVal === 'function'
//             ? handlerVal
//             : undefined,
//       };
//     } else if (
//       typeof nameVal === 'object' &&
//       nameVal !== null
//     ) {
//       result[key] = mergeNameAndHandler(
//         nameVal,
//         handlerVal || {}
//       );
//     }
//   }

//   return result;
// }
