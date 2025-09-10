import { ChatPromptTemplate } from '@langchain/core/prompts';
import type {
  AxonAgentInstructionSegments,
  InstructionSegment,
} from './__defs__';
import { getSegmentTransformation } from './_helpers';

export function formatAgentInstructions(input: AxonAgentInstructionSegments) {
  const finalInstructions: string[] = [];

  const inputSegements = Object.keys(input) as Array<InstructionSegment>;

  for (const seg of inputSegements) {
    const field = getSegmentTransformation(seg);
    const value = input[seg];

    const rendered = field.transform ? field.transform(value) : String(value);
    finalInstructions.push(`${field.label}:\n${rendered}`);
  }

  return finalInstructions.join('\n\n');
}

export function agentInstructions(input: string) {
  return ChatPromptTemplate.fromMessages([
    ['system', input],
    ['human', '{input}'],
    ['placeholder', '{agent_scratchpad}'],
  ]);
}
