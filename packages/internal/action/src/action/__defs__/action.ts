import type {
  AppContext,
  Logger,
} from '@template/app-defs';
import type { preMakeActionError } from '@template/error';
import type z from 'zod';
import type { ActionDef } from '../action-def';

export type Action = ActionDef<z.ZodTypeAny, z.ZodTypeAny>;

export type ExtractActionTypes<
  T,
  U extends 'input' | 'output',
> = U extends 'input'
  ? T extends ActionDef<infer Input, z.ZodTypeAny>
    ? Input
    : never
  : T extends ActionDef<z.ZodTypeAny, infer Output>
    ? Output
    : never;

export type ActionHandler<T extends Action> = (args: {
  input: z.infer<ExtractActionTypes<T, 'input'>>;
  context: AppContext;
  logger: Logger;
  makeError: ReturnType<typeof preMakeActionError>;
}) => Promise<{
  data: z.infer<ExtractActionTypes<T, 'output'>>;
  context: any;
}>;
