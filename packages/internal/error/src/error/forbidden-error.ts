import { AppError } from './app-error';

export class ForbiddenError extends AppError {
  public name: string = 'ForbiddenError';
}
