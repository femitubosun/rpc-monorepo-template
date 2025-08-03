import { makeError } from '@axon-ai/error';
import type z from 'zod';
import type {
  ActionDef,
  ActionGroup,
  ActionGroupHandler,
  ActionHandler,
} from './__defs__';
import { flattenActionGroup, flattenActionHandlers } from './helpers/object';

export type ModuleAction<T extends ActionDef<z.ZodAny, z.ZodAny>> = {
  handler?: ActionHandler<T>;
  def: T;
};

export class Module<T extends ActionGroup> {
  public _actions: Map<string, ModuleAction<ActionDef<z.ZodAny, z.ZodAny>>> =
    new Map();
  private _actionKeys: Map<string, string> = new Map();

  public _crons: Array<string> = [];

  constructor(
    public name: string,
    _actionGroup: T
  ) {
    const actions = flattenActionGroup<ActionDef<any, any>>(_actionGroup);

    Object.entries(actions).map(([k, v]) => {
      this._actions.set(v.name, {
        def: v,
      });
      this._actionKeys.set(k, v.name);

      if (v._settings?.cron) {
        this._crons.push(v.name);
      }
    });
  }

  registerHandlers(o: Partial<ActionGroupHandler<T>>) {
    const newHandlers = flattenActionHandlers<ActionHandler<any>>(o);

    this.#mergeIntoAction(newHandlers);
  }

  getHandler<A extends ActionDef<z.ZodSchema, z.ZodSchema>>(
    actionPath: A
  ): ActionHandler<A> | undefined {
    return this._actions.get(actionPath.name)?.handler;
  }

  clearHandlers() {
    this._actions.forEach((action, key) => {
      this._actions.set(key, {
        def: action.def,
      });
    });
  }

  #mergeIntoAction(handlers: Record<string, ActionHandler<any>>) {
    Object.entries(handlers).map(([k, handler]) => {
      const actionName = this._actionKeys.get(k);

      if (!actionName) {
        throw makeError({
          type: 'INTERNAL',
          message: 'Action Definitino not found',
        });
      }

      const existingAction = this._actions.get(actionName);

      if (!existingAction) {
        throw makeError({
          type: 'INTERNAL',
          message: 'Action Definitino not found',
        });
      }

      this._actions.set(actionName, {
        ...existingAction,
        handler,
      });
    });
  }
}
