import { AppError } from '@template/error';
import { makeLogger } from '@template/logging';
import { runtime } from '../runtime';
import { getActionProps } from './handlers';

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

  try {
    return await handler({
      ...data,
      ...getActionProps(action),
    });
  } catch (error) {
    actionLogger.error(`Error`, error);
    throw error;
  }
}
