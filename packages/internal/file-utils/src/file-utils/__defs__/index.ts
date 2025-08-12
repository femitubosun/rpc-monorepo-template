export type ExtractableFile = 'MARKDOWN' | 'PDF' | 'DOCX';

export type FileContentExtractor = (
  input: Buffer
) => Promise<{ content: string }>;
