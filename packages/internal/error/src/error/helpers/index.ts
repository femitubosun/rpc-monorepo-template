import type {
  ActionErrorOptions,
  AppErrorOptions,
} from '../__defs__';
import { AppError } from '../app-error';

export function makeError(input: AppErrorOptions) {
  return new AppError(input);
}

function makeActionError(input: ActionErrorOptions) {
  return new Error(JSON.stringify(input));
}

export function preMakeAsyncActionError(action: string) {
  return (input: Omit<ActionErrorOptions, 'action'>) =>
    makeActionError({ ...input, action });
}

export function preMakeSyncActionError(action: string) {
  return (input: Omit<ActionErrorOptions, 'action'>) =>
    makeError({ ...input, action });
}

export * from './parse-error';
