import { SpanStatusCode, trace } from '@opentelemetry/api';
import { AppError } from '@template/error';
import { makeLogger } from '@template/logging';
import { runtime } from '../runtime';
import { getActionProps } from './handlers';

const tracer = trace.getTracer('action-runtime');

export async function executeSyncHandler(
  action: string,
  data: any
): Promise<any> {
  const handler = runtime.getHandler(action);

  if (!handler) {
    throw new AppError({
      message: `No handler found for action: ${action}`,
      action,
      type: 'INTERNAL',
      data,
    });
  }

  const actionLogger = makeLogger(action.toUpperCase());

  return await tracer.startActiveSpan(`Action: ${action}`, async (span) => {
    try {
      span.setAttribute('action.name', action);
      span.setAttribute('action.type', 'sync');
      if (data.context?.user?.id) {
        span.setAttribute('user.id', data.context.user.id);
      }

      const result = await handler({
        ...data,
        context: {
          ...data.context,
          actionName: action,
        },
        ...getActionProps(action),
      });

      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
      return result;
    } catch (error) {
      span.recordException(error as Error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof AppError && !error.isLogged) {
        actionLogger.error(`Error`, error);
        error.markAsLogged();
      } else if (!(error instanceof AppError)) {
        actionLogger.error(`Error`, error);
      }
      throw error;
    } finally {
      span.end();
    }
  });
}
