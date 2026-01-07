import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { APP_DIRS } from '@template/app-utils';
import { makeLogger } from '@template/logging';

const logger = makeLogger('Router Loader');

interface ModuleRouter {
  default: any;
}

export interface LoadedModule {
  name: string;
  router: any;
}

export async function autoLoadModules(): Promise<LoadedModule[]> {
  const modulesDir = APP_DIRS.MODULES_DIR;
  const routers: LoadedModule[] = [];

  logger.info(`Starting module auto-loading from directory: ${modulesDir}`);

  try {
    const moduleNames = readdirSync(modulesDir).filter((name) => {
      const modulePath = join(modulesDir, name);
      return statSync(modulePath).isDirectory();
    });

    logger.info(
      `Found ${moduleNames.length} modules: ${moduleNames.join(', ')}`
    );

    for (const moduleName of moduleNames) {
      try {
        const modulePackageName = `@template/${moduleName}-api`;
        const moduleRouter: ModuleRouter = await import(modulePackageName);

        if (moduleRouter.default) {
          routers.push({
            name: moduleName,
            router: moduleRouter.default,
          });
          logger.info(`Loaded module: ${moduleName}`);
        } else {
          logger.warn(`Module ${moduleName} does not export a default router`);
        }
      } catch (error) {
        console.error(error);
        logger.error(`Failed to load module ${moduleName}:`, error);
      }
    }

    logger.info(`Successfully loaded ${routers.length} module routers`);
    return routers;
  } catch (error) {
    logger.error('Failed to auto-load modules:', error);
    return [];
  }
}
