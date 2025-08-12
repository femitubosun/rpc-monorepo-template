import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import type { ActionGroup, Module } from '@template/action';
import { APP_DIRS } from '@template/app-utils';
import Env from '@template/env';
import { logger } from '../../logger';

interface ModuleModule {
  default: Module<ActionGroup>;
}

export async function autoLoadModules(): Promise<
  Module<ActionGroup>[]
> {
  const modules: Module<ActionGroup>[] = [];

  try {
    const allEntries = await readdir(APP_DIRS.MODULES_DIR);
    const moduleNames = [];

    for (const name of allEntries) {
      const modulePath = join(APP_DIRS.MODULES_DIR, name);
      const stats = await stat(modulePath);
      if (stats.isDirectory()) {
        moduleNames.push(name);
      }
    }

    for (const moduleName of moduleNames) {
      const modulePackageName = `@template/${moduleName}-module`;

      try {
        if (Env.NODE_ENV !== 'testing') {
          logger.info(
            `Attempting to auto-load namespace ${modulePackageName}`
          );
        }

        const moduleModule: ModuleModule = await import(
          modulePackageName
        );

        if (Env.NODE_ENV !== 'testing') {
          logger.log(`Imported package`);
        }

        if (moduleModule.default) {
          modules.push(moduleModule.default);
        }
      } catch (e) {
        console.error(e);
        logger.warn(
          `Failed to auto-load namespace ${modulePackageName}`
        );
      }
    }

    if (Env.NODE_ENV !== 'testing') {
      logger.info(
        `Successfully loaded ${modules.length} namespace modules`
      );
    }

    return modules;
  } catch (e) {
    logger.warn(`Failed to auto-load namespace queues`, e);
    return [];
  }
}
