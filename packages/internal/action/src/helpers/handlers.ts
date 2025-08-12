import type { AppContext } from '@template/app-defs';
import { ActionCacheKey } from '@template/cache-utils';
import { preMakeAsyncActionError } from '@template/error';
import { makeLogger } from '@template/logging';

export function getWrapperHandler(
  action: string,
  originalHandler: Function
) {
  return async (input: {
    context: AppContext;
    input: unknown;
  }) => {
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
