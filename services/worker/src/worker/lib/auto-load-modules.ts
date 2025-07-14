import { readdir, stat } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import type { ActionGroup, Module } from '@template/action';
import { logger } from '../../logger';

interface ModuleModule {
  default: Module<ActionGroup>;
}

export async function autoLoadModules(): Promise<
  Module<ActionGroup>[]
> {
  const MODULES_DIR = resolve(
    process.cwd(),
    '../../modules'
  );

  const modules: Module<ActionGroup>[] = [];

  try {
    const moduleNames = (await readdir(MODULES_DIR)).filter(
      async (name) => {
        const modulePath = join(MODULES_DIR, name);
        return (await stat(modulePath)).isDirectory();
      }
    );

    for (const moduleName of moduleNames) {
      const modulePackageName = `@template/${moduleName}-module`;
      try {
        logger.info(
          `Attempting to auto-load namespace ${modulePackageName}`
        );
        const moduleModule: ModuleModule = await import(
          modulePackageName
        );

        if (moduleModule.default) {
          modules.push(moduleModule.default);
        }
      } catch (e) {
        logger.warn(
          `Failed to auto-load namespace ${modulePackageName}`
        );
        logger.warn(
          `Failed to auto-load namespace ${moduleName} queues`,
          e
        );
      }
    }

    logger.info(
      `Successfully loaded ${modules.length} namespace modules`
    );
    return modules;
  } catch (e) {
    logger.warn(`Failed to auto-load namespace queues`, e);
    return [];
  }
}
