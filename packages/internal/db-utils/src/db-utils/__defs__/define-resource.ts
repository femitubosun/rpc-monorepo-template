import type { z } from 'zod';

export interface ResourceConfig<
  T extends z.ZodType,
  ListItem extends z.ZodType,
  Filters extends z.ZodType,
  TCustomSchemas extends Record<string, z.ZodType> = Record<
    string,
    never
  >,
> {
  name: string;
  base: T;
  schemas: TCustomSchemas;
  listConfig: {
    includeSearch: boolean;
    filters: Filters;
    itemSchema: ListItem;
  };
}

export interface ResourceOperations<
  T extends z.ZodObject<any>,
> {
  create?: readonly (keyof T['shape'])[];
  update?: readonly (keyof T['shape'])[];
}

export interface DefineResourceConfig<
  T extends z.ZodObject<any>,
  ListItem extends z.ZodType,
  Filters extends z.ZodType,
  TCustomSchemas extends Record<string, z.ZodType> = Record<
    string,
    never
  >,
  TOperations extends ResourceOperations<T> = Record<
    string,
    never
  >,
> {
  name: string;
  base: T;
  operations?: TOperations;
  custom?: TCustomSchemas;
  listConfig: {
    includeSearch: boolean;
    filters: Filters;
    itemSchema: ListItem;
  };
}
