import type z from 'zod';
import type { QSettings } from './__defs__';

export class Action<
  Input extends z.ZodTypeAny,
  Output extends z.ZodTypeAny,
> {
  public readonly name: string;
  public _input?: Input;
  public _output?: Output;
  public _isAsync = false;
  public _settings?: Partial<QSettings>;

  constructor(name: string) {
    this.name = name;
  }

  input<T extends z.ZodTypeAny>(
    schema: T
  ): Action<T, Output> {
    this._input = schema as unknown as Input;
    return this as unknown as Action<T, Output>;
  }

  output<T extends z.ZodTypeAny>(
    schema: T
  ): Action<Input, T> {
    this._output = schema as unknown as Output;
    return this as unknown as Action<Input, T>;
  }

  async() {
    this._isAsync = true;
    return this;
  }

  settings(settings: Partial<QSettings>) {
    this._settings = settings;
    return this;
  }
}
