import { makeError } from '@template/error';
import type { FileContentExtractor } from './__defs__';
import { logger } from './logger';

export const extractMarkdown: FileContentExtractor = async (
  buffer: Buffer
) => {
  try {
    return {
      content: buffer.toString('utf-8'),
    };
  } catch (e) {
    logger.error(`Could not parse markdown buffer: ${e}`);

    throw makeError({
      type: 'INTERNAL',
      message: 'Could not extract mark buffer',
    });
  }
};
