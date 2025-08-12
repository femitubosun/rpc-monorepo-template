import { z } from 'zod';
import type {
  DefineResourceConfig,
  ResourceConfig,
  ResourceOperations,
} from './__defs__/define-resource';
import {
  PaginatedResultGenericSchema,
  PaginationInputSchema,
} from './__defs__/pagination';
import { toPascal } from './helpers';
import { zodPick } from './select';

/**
 * @deprecated use defineResourceSchema instead
 * @param config
 */
export function makeResourceSchema<
  T extends z.ZodType,
  ListItem extends z.ZodType,
  Filters extends z.ZodType,
  TCustomSchemas extends Record<string, z.ZodType>,
  TName extends string = string,
>(
  config: ResourceConfig<T, ListItem, Filters, TCustomSchemas> & {
    name: TName;
  }
) {
  const {
    listConfig: { includeSearch = true },
    schemas: customSchemas,
  } = config;

  const listingOutputSchema = PaginatedResultGenericSchema(
    config.listConfig.itemSchema.array()
  );

  const listingInputSchema = z.object({
    pagination: PaginationInputSchema,
    ...(includeSearch ? { search: z.string().optional() } : {}),
    filters: config.listConfig.filters,
  });

  const transformedCustomSchemas = Object.fromEntries(
    Object.entries(customSchemas).map(([key, value]) => [toPascal(key), value])
  );

  const schemas = {
    [`${toPascal(config.name)}ListingInput`]: listingInputSchema,
    [`${toPascal(config.name)}ListingOutput`]: listingOutputSchema,
    [`${toPascal(config.name)}FullOutput`]: config.base,
    [`${toPascal(config.name)}ListingItem`]: config.listConfig.itemSchema,
    ...transformedCustomSchemas,
  };

  return schemas as {
    [K in keyof TCustomSchemas as Capitalize<string & K>]: TCustomSchemas[K];
  } & {
    [K in
      | `${Capitalize<TName>}ListingInput`
      | `${Capitalize<TName>}ListingOutput`
      | `${Capitalize<TName>}FullOutput`
      | `${Capitalize<TName>}ListingItem`]: K extends `${Capitalize<TName>}ListingInput`
      ? typeof listingInputSchema
      : K extends `${Capitalize<TName>}ListingOutput`
        ? typeof listingOutputSchema
        : K extends `${Capitalize<TName>}FullOutput`
          ? T
          : K extends `${Capitalize<TName>}ListingItem`
            ? typeof config.listConfig.itemSchema
            : never;
  };
}

export function defineResourceSchema<
  T extends z.ZodObject<any>,
  ListItem extends z.ZodType,
  Filters extends z.ZodType,
  TCustomSchemas extends Record<string, z.ZodType> = Record<string, never>,
  TOperations extends ResourceOperations<T> = Record<string, never>,
  TName extends string = string,
>(
  config: DefineResourceConfig<
    T,
    ListItem,
    Filters,
    TCustomSchemas,
    TOperations
  > & {
    name: TName;
  }
) {
  const {
    listConfig: { includeSearch = true, filters, itemSchema },
    custom = {},
    operations = {},
  } = config;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const createFields = (operations as any)?.create as
    | readonly (keyof T['shape'])[]
    | undefined;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const updateFields = (operations as any)?.update as
    | readonly (keyof T['shape'])[]
    | undefined;

  const listingOutputSchema = PaginatedResultGenericSchema(itemSchema.array());

  const listingInputSchema = z.object({
    pagination: PaginationInputSchema,
    ...(includeSearch ? { search: z.string().optional() } : {}),
    filters: filters,
  });

  const createSchema = createFields
    ? zodPick(config.base, createFields)
    : undefined;
  const updateSchema = updateFields
    ? zodPick(config.base, updateFields).partial()
    : undefined;

  const transformedCustomSchemas = Object.fromEntries(
    Object.entries(custom).map(([key, value]) => [toPascal(key), value])
  );

  const baseSchemas = {
    [`${toPascal(config.name)}ListingInput`]: listingInputSchema,
    [`${toPascal(config.name)}ListingOutput`]: listingOutputSchema,
    [`${toPascal(config.name)}FullOutput`]: config.base,
    [`${toPascal(config.name)}ListingItem`]: itemSchema,
    ...transformedCustomSchemas,
  };

  const operationSchemas: Record<string, any> = {};

  if (createSchema) {
    operationSchemas[`Create${toPascal(config.name)}Schema`] = createSchema;
  }

  if (updateSchema) {
    operationSchemas[`Update${toPascal(config.name)}Schema`] = updateSchema;
  }

  const schemas = {
    ...baseSchemas,
    ...operationSchemas,
  };

  return schemas as {
    [K in keyof TCustomSchemas as Capitalize<string & K>]: TCustomSchemas[K];
  } & {
    [K in
      | `${Capitalize<TName>}ListingInput`
      | `${Capitalize<TName>}ListingOutput`
      | `${Capitalize<TName>}FullOutput`
      | `${Capitalize<TName>}ListingItem`]: K extends `${Capitalize<TName>}ListingInput`
      ? typeof listingInputSchema
      : K extends `${Capitalize<TName>}ListingOutput`
        ? typeof listingOutputSchema
        : K extends `${Capitalize<TName>}FullOutput`
          ? T
          : K extends `${Capitalize<TName>}ListingItem`
            ? typeof itemSchema
            : never;
  } & (TOperations extends {
      create: readonly (keyof T['shape'])[];
    }
      ? {
          [K in `Create${Capitalize<TName>}Schema`]: z.ZodObject<
            Pick<T['shape'], TOperations['create'][number]>
          >;
        }
      : Record<string, never>) &
    (TOperations extends {
      update: readonly (keyof T['shape'])[];
    }
      ? {
          [K in `Update${Capitalize<TName>}Schema`]: z.ZodObject<{
            [P in keyof Pick<
              T['shape'],
              TOperations['update'][number]
            >]: z.ZodOptional<T['shape'][P]>;
          }>;
        }
      : Record<string, never>);
}
