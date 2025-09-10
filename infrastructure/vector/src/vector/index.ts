import { geminiEmbedding001 } from '@template/ai/embeddings';
import { makeError } from '@template/error';
import { makeLogger } from '@template/logging';

const logger = makeLogger('Vector');

class Vector {
  /**
   * Asynchronously retrieves embeddings for a given input string.
   *
   * @param input - The input string to generate embeddings for.
   * @returns A promise that resolves with the embeddings as an array of numbers.
   */
  async getEmbeddings(input: string): Promise<number[]> {
    try {
      const startTime = performance.now();

      const embeddings = await geminiEmbedding001().embedQuery(
        this.#sanitizeString(input)
      );

      const elapsedTime = (performance.now() - startTime) / 1000;

      logger.info(`Embedding generated in ${elapsedTime} seconds`);

      return embeddings;
    } catch (error) {
      throw makeError({
        type: 'INTERNAL',
        message: `Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`,
      });
    }
  }

  #sanitizeString(input: string): string {
    return input.replaceAll(/\n/g, ' ');
  }
}

const vector = new Vector();

export default vector;
