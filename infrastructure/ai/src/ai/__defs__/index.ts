import type { GoogleGenerativeAIChatInput } from '@langchain/google-genai';

export type GeminiModel = Pick<GoogleGenerativeAIChatInput, 'model'>['model'];
