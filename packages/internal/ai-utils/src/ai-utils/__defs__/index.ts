import type z from 'zod';

export type AxonAgentInstructionSegments = {
  identity?: string[] | string;
  rules?: string[] | string;
  procedure?: string[] | string;
  writing?: string[] | string;
  backstory?: string[] | string;
  extras?: string[] | string;
  instructions?: string[] | string;
  constraints?: string[] | string;
  examples?: { role: 'user' | 'assistant'; text: string }[][];
  goal?: string[] | string;
  internalNotes?: string[] | string;
  includeGlobalContext?: boolean;
  outputStructure?: z.ZodSchema;
};

export type InstructionSegment = keyof AxonAgentInstructionSegments;

export type FieldFormatter<T> = (value: T) => string;

export type InstructionField<T> = {
  label: string;
  key: keyof AxonAgentInstructionSegments;
  transform?: FieldFormatter<T>;
  optional?: boolean;
};
