import { countTokens as anthropicCountTokens } from '@anthropic-ai/tokenizer';

export function estimateTokens(input: string): number {
  return anthropicCountTokens(input);
}
