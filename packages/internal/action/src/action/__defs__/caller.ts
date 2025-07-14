import type z from 'zod';
import type { ActionDef } from '../action-def';
import type { ExtractActionTypes } from './action';

export type ActionCaller<T extends ActionDef<any, any>> = (
  aName: T,
  input: {
    context: any;
    input: z.infer<ExtractActionTypes<T, 'input'>>;
  }
) => Promise<z.infer<ExtractActionTypes<T, 'output'>>>;
