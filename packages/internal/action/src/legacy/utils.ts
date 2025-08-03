// import type z from 'zod';
// import type {
//   ActionGroup,
//   ExtractActionTypes,
// } from './action/__defs__';
// import { ActionDef } from './action/action-def';
// import {
//   enqueueAction,
//   callAction as systemCallAction,
// } from './action/action-system';
// import { Module } from './action/module';

// /**
//  * Function to define an action group
//  * @param def
//  * @constructor
//  */
// export function G<T extends ActionGroup>(def: T): T {
//   return def;
// }

// /**
//  * Function to define an action
//  * @param name
//  * @constructor
//  */
// export function A(name: string) {
//   return new ActionDef(name);
// }

// /**
//  * Function to call an action and await the result
//  * @param action
//  * @param input
//  * @constructor
//  */
// export const callAction = async <
//   T extends ActionDef<any, any>,
// >(
//   action: T,
//   input: {
//     context: any;
//     input: z.infer<ExtractActionTypes<T, 'input'>>;
//   }
// ): Promise<{
//   context: any;
//   data: z.infer<ExtractActionTypes<T, 'output'>>;
// }> => {
//   return (await systemCallAction(
//     action.name,
//     input,
//     action._isAsync
//   )) as Promise<z.infer<ExtractActionTypes<T, 'output'>>>;
// };

// /**
//  * Function to add an action to the queue
//  * @param action
//  * @param input
//  * @constructor
//  */
// export const scheduleAction = async <
//   T extends ActionDef<any, any>,
// >(
//   action: T,
//   input: {
//     context: any;
//     input: z.infer<ExtractActionTypes<T, 'input'>>;
//   }
// ): Promise<void> => {
//   await enqueueAction(action.name, input);
// };

// /**
//  * Function to make an action module
//  * @param string module name
//  * @param g group definition
//  */
// export function makeModule<T extends ActionGroup>(
//   string: string,
//   g: T
// ): Module<T> {
//   return new Module(string, g);
// }
