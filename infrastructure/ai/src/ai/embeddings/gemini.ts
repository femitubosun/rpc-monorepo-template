import {
  GoogleGenerativeAIEmbeddings,
  type GoogleGenerativeAIEmbeddingsParams,
} from '@langchain/google-genai';
import Env from '@template/env';

export const geminiEmbedding001 = (
  input?: Partial<GoogleGenerativeAIEmbeddingsParams>
) =>
  new GoogleGenerativeAIEmbeddings({
    model: 'gemini-embedding-001',
    apiKey: Env.GOOGLE_GEMINI_API_KEY,
    ...input,
  });
