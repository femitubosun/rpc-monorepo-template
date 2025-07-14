import { logger } from '../logger';
import { autoLoadModules } from './lib';

async function main() {
  const modules = await autoLoadModules();
  await Promise.all(
    modules.map((module) => module.start())
  );

  logger.log(
    `Started workers in ${modules.length} modules`
  );
}

await main();
