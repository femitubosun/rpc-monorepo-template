import type { Action, ActionHandler } from './action';
import type { ActionDef } from './action-def';

export type ActionGroup = {
  [key: string]: Action | ActionGroup;
};

type ActionGroupDefHandler<Ag extends ActionGroup> = {
  [AgK in keyof Ag]?: Ag[AgK] extends Action
    ? ActionHandler<Ag[AgK]>
    : Ag[AgK] extends ActionGroup
      ? Partial<ActionGroupDefHandler<Ag[AgK]>>
      : never;
};

export type ActionGroupHandler<T extends ActionGroup> =
  ActionGroupDefHandler<T>;

export type ActionStructure<T extends ActionGroup> = {
  [K in keyof T]: T[K] extends ActionDef<any, any>
    ? string
    : T[K] extends ActionGroup
      ? ActionStructure<T[K]>
      : never;
};

// Type to extract handler type for a specific action from ActionGroup
export type ExtractActionHandler<
  _AG extends ActionGroup,
  ActionPath extends ActionDef<any, any>,
> = ActionPath extends Action
  ? ActionHandler<ActionPath>
  : never;
