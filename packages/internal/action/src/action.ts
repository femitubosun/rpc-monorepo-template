import type z from "zod";
import type { QSettings } from "./__defs__";

/**
 * @description Action defiition
 */
export class Action<Input extends z.ZodTypeAny, Output extends z.ZodTypeAny> {
  public readonly name: string;
  public _input?: Input;
  public _output?: Output;
  public _isAsync = false;
  public _settings?: Partial<QSettings>;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * @description Action input schema
   * @param schema
   * @returns
   */
  input<T extends z.ZodTypeAny>(schema: T): Action<T, Output> {
    this._input = schema as unknown as Input;
    return this as unknown as Action<T, Output>;
  }

  /**
   * @description Action output schema
   * @param schema
   * @returns
   */
  output<T extends z.ZodTypeAny>(schema: T): Action<Input, T> {
    this._output = schema as unknown as Output;
    return this as unknown as Action<Input, T>;
  }

  /**
   * @description Mark action as async
   * @param schema
   * @returns
   */
  async() {
    this._isAsync = true;
    return this;
  }

  /**
   * @description Configure action settings
   * @param schema
   * @returns
   */
  settings(settings: Partial<QSettings>) {
    this._settings = settings;
    return this;
  }
}
