import {
  type AppErrorOptions,
  type AppErrorType,
  AppErrorTypeDef,
} from './__defs__';

export class AppError extends Error {
  public name = 'AppError';
  public type: AppErrorType = 'INTERNAL';
  public message: string;
  public action?: string;
  public data: any = {};
  public code?: number;

  constructor({
    message,
    type,
    code,
    data,
    action,
  }: AppErrorOptions) {
    super(message);

    Error.call(this);
    Error.captureStackTrace(this, this.constructor);

    this.message = message;
    this.type = type ?? this.type;
    this.data = data ?? this.data;
    this.action = action ?? this.action;
    this.code =
      code ??
      (this.type ? AppErrorTypeDef[this.type].code : 500);

    Object.defineProperties(this, {
      name: { enumerable: true },
      action: { enumerable: true },
      type: { enumerable: true },
      message: { enumerable: true },
      data: { enumerable: true },
      stack: { enumerable: true },
      code: { enumerable: true },
    });

    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      action: this.action,
      type: this.type,
      message: this.message,
      data: this.data,
      stack: this.stack,
      code: this.code,
    };
  }

  toProdJSON() {
    return {
      type: this.type,
      message: this.message,
    };
  }

  static fromActionFailReason(reason: string): AppError {
    try {
      const errorObject: AppErrorOptions =
        JSON.parse(reason);

      return new AppError(errorObject);
    } catch {
      return new AppError({
        message: reason,
        type: 'INTERNAL',
      });
    }
  }
}
