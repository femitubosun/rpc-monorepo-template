import { makeError } from '@template/error';
import { pdfToText } from 'pdf-ts';
import type { FileContentExtractor } from './__defs__';
import { logger } from './logger';

export const extractPdf: FileContentExtractor = async (buffer: Buffer) => {
  try {
    const result = await pdfToText(buffer);

    return {
      content: result,
    };
  } catch (e) {
    logger.error(`Could not extract buffer: ${e}`);

    throw makeError({
      type: 'INTERNAL',
      message: 'Could not extract pdf buffer',
    });
  }
};
