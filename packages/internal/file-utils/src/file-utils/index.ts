import type {
  ExtractableFile,
  FileContentExtractor,
} from './__defs__';
import { extractDocx } from './extract-docx';
import { extractMarkdown } from './extract-markdown';
import { extractPdf } from './extract-pdf';

export function getFileExtractor(
  fileType: ExtractableFile
): FileContentExtractor {
  switch (fileType) {
    case 'DOCX':
      return extractDocx;
    case 'PDF':
      return extractPdf;
    case 'MARKDOWN':
      return extractMarkdown;
  }
}
