import z from 'zod';
import {
  type ExtractResultType,
  type FindManyWithPaginationInput,
  type PaginatedResult,
  type PaginationInput,
  PaginationInputSchema,
  type PrismaDelegate,
} from './__defs__/pagination';

export const CreatePaginatedOutputSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    data: schema.array(),
    meta: z.object({
      total: z.number(),
      totalPages: z.number(),
      perPage: z.number(),
      page: z.number(),
    }),
  });

// Type-safe listing input schema builder without spread gymnastics
export function CreateListingInputSchema<
  TConfig extends {
    search?: boolean;
    filters?: z.ZodType;
    pagination?: boolean;
  },
>(config: TConfig) {
  const nullablePaginationSchema = PaginationInputSchema.nullish();

  type Schema = {} & (TConfig['search'] extends true
    ? { search: z.ZodOptional<z.ZodNullable<z.ZodString>> }
    : {}) &
    (TConfig['filters'] extends z.ZodType
      ? { filters: TConfig['filters'] }
      : {}) &
    (TConfig['pagination'] extends true
      ? { pagination: typeof nullablePaginationSchema }
      : {});

  const schema: any = {};

  if (config.search === true) {
    schema.search = z.string().nullish();
  }

  if (config.filters) {
    schema.filters = config.filters;
  }

  if (config.pagination === true) {
    schema.pagination = PaginationInputSchema.nullish();
  }

  return z.object(schema) as z.ZodObject<Schema>;
}

export async function findManyWithPagination<
  TDelegate extends PrismaDelegate,
  TArgs extends Parameters<TDelegate['findMany']>[0],
>(
  input: FindManyWithPaginationInput<TDelegate, TArgs>
): Promise<PaginatedResult<ExtractResultType<TDelegate, TArgs>>> {
  const { pagination, modelDelegate, findManyArgs } = input;

  const paginationParams = toPrismaSkipTake(
    pagination || {
      page: 1,
      perPage: 100,
    }
  );
  const skip = paginationParams?.skip || 0;
  const take = paginationParams?.take || 10;

  const [data, total] = await Promise.all([
    modelDelegate.findMany({
      ...findManyArgs,
      skip,
      take,
    }),
    modelDelegate.count({
      where: findManyArgs?.where,
    }),
  ]);

  return {
    data: data as ExtractResultType<TDelegate, TArgs>[],
    meta: {
      total,
      totalPages: Math.ceil(total / take),
      perPage: take,
      page: Math.floor(skip / take) + 1,
    },
  };
}

export const toPrismaSkipTake = (pagination: PaginationInput) => ({
  skip: (pagination.page - 1) * pagination.perPage,
  take: pagination.perPage,
});
