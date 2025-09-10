import { Queue, runtime } from '@template/action';
import Env from '@template/env';
import { logger } from '../logger';
import { autoLoadModules } from './lib';
import { getRedisConn } from './redis';

export async function startActionRuntime(addQueueToActionRuntime: boolean) {
  const modules = await autoLoadModules();

  if (addQueueToActionRuntime) {
    runtime.init(modules, new Queue(getRedisConn()));
  } else {
    runtime.init(modules);
  }

  await runtime.start();

  const gracefulShutdown = async () => {
    logger.log('Shutting down worker runtime gracefully...');
    try {
      await runtime.shutdown();
      logger.log('Worker runtime closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during worker runtime shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);

  if (Env.NODE_ENV !== 'testing') {
    logger.log(`Started workers in ${modules.length} modules`);
  }
}
