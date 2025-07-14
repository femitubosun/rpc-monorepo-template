import { AppError } from './app-error';

export class UnauthenticatedError extends AppError {
  public name: string = 'UnauthenticatedError';
}
