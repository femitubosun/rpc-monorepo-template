import { type StructuredTool, tool } from '@langchain/core/tools';
import type z from 'zod';

export class AxonAgentToolBuilder<T extends z.ZodSchema> {
  _input: T;
  _name?: string;
  _desc?: string;
  _fn?: (input: z.infer<T>) => Promise<unknown>;

  constructor(inputSchema: T) {
    this._input = inputSchema;
  }

  name(name: string): AxonAgentToolBuilder<T> {
    this._name = name;
    return this;
  }

  description(desc: string): AxonAgentToolBuilder<T> {
    this._desc = desc;
    return this;
  }

  fn(fn: (input: z.infer<T>) => Promise<unknown>): AxonAgentToolBuilder<T> {
    this._fn = fn;
    return this;
  }

  build(): StructuredTool {
    if (!this._name || !this._desc || !this._fn) {
      throw new Error('Name, description, and function are required');
    }

    const name = this._name;
    const desc = this._desc;
    const schema = this._input;
    const fn = this._fn;

    return tool(fn, {
      name,
      description: desc,
      schema,
    });
  }
}

export function createToolWithInputSchema<T extends z.ZodSchema>(schema: T) {
  return new AxonAgentToolBuilder<T>(schema);
}
