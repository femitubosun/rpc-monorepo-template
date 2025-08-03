import type { AppContext } from "@axon-ai/app-defs";
import { ActionCacheKey } from "@axon-ai/cache-utils";
import { preMakeAsyncActionError } from "@axon-ai/error";
import { makeLogger } from "@axon-ai/logging";

export function getWrapperHandler(action: string, originalHandler: Function) {
  return async (input: { context: AppContext; input: unknown }) => {
    return await originalHandler({
      ...getActionProps(action),
      context: input.context,
      input: input.input,
    });
  };
}

export function getActionProps(action: string) {
  const logger = makeLogger(action.toUpperCase());
  const makeError = preMakeAsyncActionError(action);
  const cacheKey = new ActionCacheKey(action);

  return {
    logger,
    makeError,
    cacheKey,
  };
}
