import { resolve } from 'node:path';
import { config, Env } from '@template/env';
import { main } from './server';

Env.NODE_ENV !== 'production' &&
  config({ path: resolve(process.cwd(), '.env') });

import '@template/worker-service';

main();
