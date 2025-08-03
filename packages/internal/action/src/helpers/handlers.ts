import { ActionCacheKey } from '@axon-ai/cache-utils';
import { preMakeAsyncActionError } from '@axon-ai/error';
import { makeLogger } from '@axon-ai/logging';

export function getWrapperHandler(action: string, originalHandler: Function) {
  return async (job: any) => {
    return await originalHandler({
      ...getActionProps(action),
      ...job.data,
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
