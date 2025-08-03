// import type {
//   ActionGroup,
//   ActionStructure,
// } from '../__defs__';
// import { ActionDef } from '../action-def';

// export function getActionStructure<T extends ActionGroup>(
//   group: T
// ): ActionStructure<T> {
//   return Object.entries(group).reduce(
//     (acc, [key, value]) => {
//       if (value instanceof ActionDef) {
//         return {
//           ...acc,
//           [key]: value.name,
//         };
//       }
//       return {
//         ...acc,
//         [key]: getActionStructure(value),
//       };
//     },
//     {} as ActionStructure<T>
//   );
// }

// export function getActions(
//   group: ActionGroup
// ): ActionDef<any, any>[] {
//   return Object.values(group).reduce<
//     Array<ActionDef<any, any>>
//   >((acc, item) => {
//     if (item instanceof ActionDef) {
//       acc.push(item);

//       return acc;
//     }
//     acc.push(...getActions(item));
//     return acc;
//   }, []);
// }
