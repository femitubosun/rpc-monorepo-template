import { gemini1_5Flash } from '@template/ai/providers';
import { makeError } from '@template/error';
import { makeLogger } from '@template/logging';
import LLMScraper from 'llm-scraper';
import type z from 'zod';
import type { ScrapeInput } from './__defs__';

const logger = makeLogger('Scraper');

class Scraper {
  #model: any;
  public client: LLMScraper;

  constructor() {
    this.#model = gemini1_5Flash();
    this.client = new LLMScraper(this.#model);
  }

  async scrape<T extends z.ZodAny>(
    input: ScrapeInput<T>
  ): Promise<z.infer<T>[]> {
    try {
      const result = await this.client.run(input.page, input.output, {
        format: input.format ?? 'markdown',
      });

      return result.data as unknown as Promise<z.infer<T>[]>;
    } catch (e) {
      logger.warn('Error scraping data');

      throw makeError({
        type: 'INTERNAL',
        message: (e as any).message,
      });
    }
  }
}

const scraper = new Scraper();

export default scraper;
