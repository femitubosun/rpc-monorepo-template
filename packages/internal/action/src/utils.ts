import type z from 'zod';
import {
  ActionDef,
  type ActionGroup,
  type ExtractActionTypes,
} from './__defs__';

import { executeSyncHandler } from './helpers/index';
import { Module } from './module';
import { runtime } from './runtime';

/**
 * Function to call an action and await the result
 * @param action
 * @param input
 * @constructor
 */
export const callAction = async <T extends ActionDef<any, any>>(
  action: T,
  input: {
    context: any;
    input: z.infer<ExtractActionTypes<T, 'input'>>;
  }
): Promise<{
  context: any;
  data: z.infer<ExtractActionTypes<T, 'output'>>;
}> => {
  const res = await executeSyncHandler(action.name, input);

  return res as Promise<z.infer<ExtractActionTypes<T, 'output'>>>;
};

/**
 * Function to add an action to the queue
 * @param action
 * @param input
 * @constructor
 */
export const scheduleAction = async <T extends ActionDef<any, any>>(
  action: T,
  input: {
    context: any;
    input: z.infer<ExtractActionTypes<T, 'input'>>;
  }
): Promise<void> => {
  return await runtime.scheduleJob(action, input);
};

/**
 * Function to make an action module
 * @param string module name
 * @param g group definition
 */
export function makeModule<T extends ActionGroup>(
  string: string,
  group: T
): Module<T> {
  return new Module(string, group);
}

/**
 * Function to define an action group
 * @param def
 * @constructor
 */
export function G<T extends ActionGroup>(def: T): T {
  return def;
}

/**
 * Function to define an action
 * @param name
 * @constructor
 */
export function A(name: string) {
  return new ActionDef(name);
}
