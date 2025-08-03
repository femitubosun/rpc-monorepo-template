import type z from "zod";
import type { ActionHandler } from "./action";
import type { ActionDef } from "./action-def";

export type ModuleAction<T extends ActionDef<z.ZodAny, z.ZodAny>> = {
  handler?: ActionHandler<T>;
  def: T;
};
