import type {
  FindManyWithPaginationInput,
  PaginatedResult,
  PaginationInput,
} from './__defs__/pagination';

export async function findManyWithPagination<T>(
  input: FindManyWithPaginationInput
): Promise<PaginatedResult<T>> {
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      where: findManyArgs.where,
    }),
  ]);

  return {
    data: data as T[],
    meta: {
      total,
      totalPages: Math.ceil(total / take),
      perPage: take,
      page: Math.floor(skip / take) + 1,
    },
  };
}

export const toPrismaSkipTake = (
  pagination: PaginationInput
) => ({
  skip: (pagination.page - 1) * pagination.perPage,
  take: pagination.perPage,
});
