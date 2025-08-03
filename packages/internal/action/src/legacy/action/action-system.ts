// import { makeLogger } from '@axon-ai/logging';
// import {
//   clearSyncHandlers,
//   executeSyncHandler,
//   indexModuleHandlers,
// } from './handlers';
// import {
//   cleanUp as cleanupQueues,
//   executeJob,
//   scheduleJob,
// } from './queues';

// const logger = makeLogger('ActionSystem');

// const modules = new Map<string, any>();

// export function registerModule(module: any): void {
//   modules.set(module.name, module);
//   indexModuleHandlers(module);
// }

// export async function callAction(
//   action: string,
//   data: any,
//   isAsync: boolean
// ): Promise<any> {
//   if (!isAsync) {
//     return await executeSyncHandler(action, data);
//   }
//   return await executeJob(action, data);
// }

// export async function enqueueAction(
//   action: string,
//   data: any
// ): Promise<void> {
//   await scheduleJob(action, data);
// }

// export async function cleanup(): Promise<void> {
//   logger.info('Cleaning up action system...');

//   await cleanupQueues();
//   clearSyncHandlers();
//   modules.clear();

//   logger.info('Action system cleanup complete');
// }

// process.on('SIGINT', async () => {
//   logger.info('Received SIGINT, cleaning up...');
//   await cleanup();
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   logger.info('Received SIGTERM, cleaning up...');
//   await cleanup();
//   process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//   logger.error('Uncaught Exception:', error);
//   process.exit(1);
// });

// process.on('unhandledRejection', (reason, promise) => {
//   logger.error(
//     `Unhandled Rejection [${reason}] at:}`,
//     promise
//   );
//   process.exit(1);
// });
