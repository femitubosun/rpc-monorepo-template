import { makeError } from '@template/error';
import mammoth from 'mammoth';
import type { FileContentExtractor } from './__defs__';
import { logger } from './logger';

export const extractDocx: FileContentExtractor = async (
  input: Buffer
) => {
  try {
    const result = await mammoth.extractRawText({
      buffer: input,
    });

    return {
      content: result.value,
    };
  } catch (e) {
    logger.error(`Could not extract docx buffer: ${e}`);

    throw makeError({
      type: 'INTERNAL',
      message: 'Could not extract docx buffer',
    });
  }
};
