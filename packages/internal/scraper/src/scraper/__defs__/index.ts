import type { Page } from 'playwright';
import type z from 'zod';

export type ScrapeInput<Output extends z.ZodType> = {
  output: Output;
  page: Page;
  format?: 'html' | 'text' | 'markdown' | 'raw_html';
};
