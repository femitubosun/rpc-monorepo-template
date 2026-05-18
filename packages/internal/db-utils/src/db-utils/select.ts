import { z } from 'zod';
/* eslint-disable */

export type DeepZodToPrismaSelectMapper<T> =
  T extends z.ZodObject<infer Shape>
    ? {
        select: {
          [K in keyof Shape]: DeepZodToPrismaSelectMapper<Shape[K]>;
        };
      }
    : T extends z.ZodArray<infer Item>
      ? DeepZodToPrismaSelectMapper<Item>
      : true;

export type ZodToPrismaSelectMapper<T> =
  T extends z.ZodObject<infer Shape>
    ? {
        [K in keyof Shape]: DeepZodToPrismaSelectMapper<Shape[K]>;
      }
    : T extends z.ZodArray<infer Item>
      ? DeepZodToPrismaSelectMapper<Item>
      : true;

function extractInnerType(type: z.ZodTypeAny): z.ZodTypeAny {
  if (
    type instanceof z.ZodOptional ||
    type instanceof z.ZodNullable ||
    type._def.type === 'optional' ||
    type._def.type === 'nullable'
  ) {
    return extractInnerType((type._def as any).innerType);
  }
  return type;
}

export function zodToPrismaSelect<T extends z.ZodType<any, any>>(
  schema: T
): ZodToPrismaSelectMapper<T> {
  const fields = (schema._def as any).shape;
  const result = {};
  for (const key in fields) {
    const field = extractInnerType(fields[key]);
    const fieldDef = field._def as any;
    if (
      fieldDef.type === 'array' &&
      fieldDef.element._def.type === 'object'
    ) {
      // @ts-expect-error
      result[key] = {
        select: zodToPrismaSelect(fieldDef.element),
      };
    } else if (fieldDef.type === 'object') {
      // @ts-expect-error
      result[key] = {
        select: zodToPrismaSelect(field),
      };
    } else {
      // @ts-expect-error
      result[key] = true;
    }
  }
  return result as any;
}

export function zodPick<
  T extends z.ZodObject<any>,
  K extends readonly (keyof T['shape'])[],
>(schema: T, keys: K): z.ZodObject<Pick<T['shape'], K[number]>> {
  const pickedShape = {} as Pick<T['shape'], K[number]>;

  for (const key of keys) {
    if (key in schema.shape) {
      pickedShape[key] = schema.shape[key];
    }
  }

  return z.object(pickedShape);
}
