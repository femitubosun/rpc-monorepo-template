import type { ActionDef } from '../action-def';
import type { Action, ActionHandler } from './action';

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
