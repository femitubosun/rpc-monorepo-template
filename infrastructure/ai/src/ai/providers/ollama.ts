import { ChatOllama, type OllamaInput } from '@langchain/ollama';

export type ModelessOllamaInput = Partial<Omit<OllamaInput, 'model'>>;

export function ollamaChat(input?: Partial<OllamaInput>) {
  return new ChatOllama({
    temperature: 0.45,
    streaming: true,
    metadata: {
      agentMethod: 'OLLAMA',
    },
    ...input,
  });
}

export const ollamaLlama32B = (input?: Partial<OllamaInput>) =>
  ollamaChat({ model: 'llama3.2:latest', ...input });

export const ollamaDeepseekR1 = (input?: Partial<OllamaInput>) =>
  ollamaChat({
    model: 'deepseek-r1:latest',
    ...input,
  });

export const gemma31b = (input?: Partial<OllamaInput>) =>
  ollamaChat({
    model: 'gemma3:1b',
    ...input,
  });

export const gemma34b = (input?: Partial<OllamaInput>) =>
  ollamaChat({
    model: 'gemma3:4b',
    ...input,
  });

export const gemma312b = (input?: Partial<OllamaInput>) =>
  ollamaChat({
    model: 'gemma3:12b',
    ...input,
  });

export const phi4Reasoning = (input?: Partial<OllamaInput>) =>
  ollamaChat({
    model: 'phi4-reasoning:14b',
    ...input,
  });

export const qwen314b = (input?: Partial<OllamaInput>) =>
  ollamaChat({
    model: 'qwen3:14b',
    ...input,
  });
