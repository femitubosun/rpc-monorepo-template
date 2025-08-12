import type { Logger } from '@template/app-defs';
import { AppError } from '@template/error';

export type ActionRegistry = {
  [key: string]: {
    name: string;
    queue: any;
    worker: any;
    input: any;
    output: any;
  };
};

export type PendingJob =
  | {
      resolve: (value: any) => void;
      reject: (error: any) => void;
      handleTimeout: NodeJS.Timeout;
      action: string;
      logger: Logger;
      type: 'action';
      data: any;
    }
  | {
      type: 'background-job';
      action: string;
      logger: Logger;
      data: any;
    }
  | {
      type: 'wait-native';
      action: string;
      logger: Logger;
      data: any;
      reject: (error: any) => void;
    };

export class QueueConnectionError extends AppError {
  constructor(queueName: string, originalError: Error) {
    super({
      message: `Queue ${queueName} connection failed: ${originalError.message}`,
      type: 'INTERNAL',
      action: queueName,
    });
    this.name = 'QueueConnectionError';
    this.cause = originalError;
  }
}
