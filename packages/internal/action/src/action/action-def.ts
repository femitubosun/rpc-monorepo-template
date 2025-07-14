import type z from 'zod';

export class ActionDef<
  Input extends z.ZodTypeAny,
  Output extends z.ZodTypeAny,
> {
  public readonly name: string;
  public _input?: Input;
  public _output?: Output;

  constructor(name: string) {
    this.name = name;
  }

  input<T extends z.ZodTypeAny>(
    schema: T
  ): ActionDef<T, Output> {
    this._input = schema as any;
    return this as any;
  }

  output<T extends z.ZodTypeAny>(
    schema: T
  ): ActionDef<Input, T> {
    this._output = schema as any;
    return this as any;
  }
}
