import type { AppContext } from '@template/app-defs';
import { preMakeAsyncActionError } from '@template/error';
import { makeLogger } from '@template/logging';
import { makeActionCacheKey } from '../utils';

export function getWrapperHandler(action: string, originalHandler: Function) {
  return async (input: { context: AppContext; input: unknown }) => {
    const enhancedContext: AppContext = {
      ...input.context,
      actionName: action,
    };

    return await originalHandler({
      ...getActionProps(action),
      context: enhancedContext,
      input: input.input,
    });
  };
}

export function getActionProps(action: string): {
  logger: ReturnType<typeof makeLogger>;
  makeError: ReturnType<typeof preMakeAsyncActionError>;
  cacheKey: ReturnType<typeof makeActionCacheKey>;
} {
  const logger = makeLogger(action.toUpperCase());
  const makeError = preMakeAsyncActionError(action);
  const cacheKey = makeActionCacheKey(action);

  return {
    logger,
    makeError,
    cacheKey,
  };
}
