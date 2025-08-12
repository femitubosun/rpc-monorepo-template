// import { ActionCacheKey } from '@template/cache-utils';
// import {
//   AppError,
//   preMakeSyncActionError,
// } from '@template/error';
// import { makeLogger } from '@template/logging';

// const syncHandlers = new Map<string, any>();

// export function registerSyncHandler(
//   action: string,
//   handler: any
// ): void {
//   syncHandlers.set(action, handler);
// }

// export async function executeSyncHandler(
//   action: string,
//   data: any
// ): Promise<any> {
//   const handler = syncHandlers.get(action);

//   if (!handler) {
//     throw new AppError({
//       message: `No handler found for action: ${action}`,
//       action,
//       type: 'INTERNAL',
//       data,
//     });
//   }

//   const { context, input } = data;
//   const actionLogger = makeLogger(action.toUpperCase());
//   const makeError = preMakeSyncActionError(action);
//   const cacheKey = new ActionCacheKey(action);

//   try {
//     return await handler({
//       makeError,
//       input,
//       context,
//       logger: actionLogger,
//       cacheKey,
//     });
//   } catch (error) {
//     actionLogger.error(`Error`, error);
//     throw error;
//   }
// }

// export function indexModuleHandlers(module: any): void {
//   const actionStructure = module._actionNames();
//   const handlers = module._handlers;

//   indexHandlersRecursive(actionStructure, handlers);
// }

// function indexHandlersRecursive(
//   structure: any,
//   handlers: any
// ): void {
//   for (const key in structure) {
//     const value = structure[key];

//     if (typeof value === 'string') {
//       const handler = handlers?.[key];
//       if (handler && typeof handler === 'function') {
//         syncHandlers.set(value, handler);
//       }
//     } else if (
//       typeof value === 'object' &&
//       value !== null
//     ) {
//       const nestedHandlers = handlers?.[key];
//       if (
//         nestedHandlers &&
//         typeof nestedHandlers === 'object'
//       ) {
//         indexHandlersRecursive(value, nestedHandlers);
//       }
//     }
//   }
// }

// export function clearSyncHandlers(): void {
//   syncHandlers.clear();
// }
