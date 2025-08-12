import { Queue, runtime } from "@template/action";
import Env from "@template/env";
import { logger } from "../logger";
import { autoLoadModules } from "./lib";
import { getRedisConn } from "./redis";

export async function startActionRuntime(addQueueToActionRuntime: boolean) {
  const modules = await autoLoadModules();

  if (addQueueToActionRuntime) {
    runtime.init(modules, new Queue(getRedisConn()));
  } else {
    runtime.init(modules);
  }

  await runtime.start();

  if (Env.NODE_ENV !== "testing") {
    logger.log(`Started workers in ${modules.length} modules`);
  }
}
