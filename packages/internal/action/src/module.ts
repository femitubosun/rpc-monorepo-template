import { makeError } from '@template/error';
import type z from 'zod';
import type {
  ActionDef,
  ActionGroup,
  ActionGroupHandler,
  ActionHandler,
} from './__defs__';
import { flattenActionGroup, flattenActionHandlers } from './helpers/object';

export type ModuleAction<T extends ActionDef<z.ZodTypeAny, z.ZodTypeAny>> = {
  handler?: ActionHandler<T>;
  def: T;
};

export class Module<T extends ActionGroup> {
  public _actions: Map<string, ModuleAction<ActionDef<z.ZodTypeAny, z.ZodTypeAny>>> =
    new Map();
  private _actionKeys: Map<string, string> = new Map();

  public _crons: Array<string> = [];

  constructor(
    public name: string,
    _actionGroup: T
  ) {
    const actions = flattenActionGroup<ActionDef<any, any>>(_actionGroup);

    Object.entries(actions).forEach(([k, v]) => {
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

  getHandler<A extends ActionDef<z.ZodTypeAny, z.ZodTypeAny>>(
    actionPath: A
  ): ActionHandler<A> | undefined {
    return this._actions.get(actionPath.name)?.handler as ActionHandler<A> | undefined;
  }

  clearHandlers() {
    this._actions.forEach((action, key) => {
      this._actions.set(key, {
        def: action.def,
      });
    });
  }

  #mergeIntoAction(handlers: Record<string, ActionHandler<any>>) {
    Object.entries(handlers).forEach(([k, handler]) => {
      const actionName = this._actionKeys.get(k);

      if (!actionName) {
        throw makeError({
          type: 'INTERNAL',
          message: `Action Definition not found ${actionName}`,
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
