import Env, { validateAppEnv } from '@template/env';
import startActionRuntime from '@template/worker-service';
import { main } from './server';

(async () => {
  await validateAppEnv(process.env);

  await startActionRuntime(Env.ADD_QUEUE_TO_ACTION);
})();

main();
