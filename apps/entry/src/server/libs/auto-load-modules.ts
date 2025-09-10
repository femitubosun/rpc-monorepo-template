import { readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { makeLogger } from '@template/logging';

const logger = makeLogger('Router Loader');

interface ModuleRouter {
  default: any;
}

export async function autoLoadModules(): Promise<any[]> {
  const modulesDir = resolve(process.cwd(), '../../modules');
  const routers: any[] = [];

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
          routers.push(moduleRouter.default);
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
