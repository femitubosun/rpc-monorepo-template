import {
  context as otelContext,
  propagation,
  SpanStatusCode,
  trace,
} from '@opentelemetry/api';
import type { AppContext } from '@template/app-defs';
import { preMakeAsyncActionError } from '@template/error';
import { makeLogger } from '@template/logging';
import { makeActionCacheKey } from '../utils';

const tracer = trace.getTracer('action-runtime');

export function getWrapperHandler(action: string, originalHandler: Function) {
  return async (input: {
    context: AppContext;
    input: unknown;
    traceContext?: Record<string, unknown>;
  }) => {
    const extractedContext = input.traceContext
      ? propagation.extract(otelContext.active(), input.traceContext)
      : otelContext.active();

    return await otelContext.with(extractedContext, async () => {
      return await tracer.startActiveSpan(`Action: ${action}`, async (span) => {
        try {
          span.setAttribute('action.name', action);
          span.setAttribute('action.type', 'async');
          if (input.context?.userId) {
            span.setAttribute('user.id', input.context.userId);
          }

          const enhancedContext: AppContext = {
            ...input.context,
            actionName: action,
          };

          const result = await originalHandler({
            ...getActionProps(action),
            context: enhancedContext,
            input: input.input,
          });

          span.setStatus({ code: SpanStatusCode.OK });
          return result;
        } catch (error) {
          span.recordException(error as Error);
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : 'Unknown error',
          });
          throw error;
        } finally {
          span.end();
        }
      });
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
