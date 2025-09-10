import {
  ChatGoogleGenerativeAI,
  type GoogleGenerativeAIChatInput,
} from '@langchain/google-genai';
import Env from '@template/env';
import type { GeminiModel } from '../__defs__';

export function googleChat(
  input: Partial<GoogleGenerativeAIChatInput> & {
    model: GeminiModel;
  }
) {
  return new ChatGoogleGenerativeAI({
    temperature: 0.5,
    streaming: true,
    apiKey: Env.GOOGLE_GEMINI_API_KEY,
    metadata: {
      agentMethod: 'Google',
    },
    model: input.model,
  });
}

export const gemini1_5Flash = (input?: Partial<GoogleGenerativeAIChatInput>) =>
  googleChat({ model: 'gemini-1.5-flash', ...input });

export const gemini2_0Flash = (input?: Partial<GoogleGenerativeAIChatInput>) =>
  googleChat({ model: 'gemini-2.0-flash', ...input });

export const gemini2_5Flash = (input?: Partial<GoogleGenerativeAIChatInput>) =>
  googleChat({
    model: 'gemini-2.5-flash',
    ...input,
    apiKey: Env.GOOGLE_GEMINI_API_KEY,
  });

export const gemini2_5FlashPreview = (
  input?: Partial<GoogleGenerativeAIChatInput>
) =>
  googleChat({
    model: 'gemini-2.5-flash-lite-preview-06-17',
    ...input,
  });

export const gemini2_5Pro = (input?: Partial<GoogleGenerativeAIChatInput>) =>
  googleChat({ model: 'gemini-2.5-pro', ...input });
