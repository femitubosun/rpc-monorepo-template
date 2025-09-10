import { z } from 'zod';

export const PaginationInputSchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(10),
});

export type PaginationInput = z.infer<typeof PaginationInputSchema>;

export type PrismaDelegate = {
  findMany: (args?: any) => Promise<any[]>;
  count: (args?: any) => Promise<number>;
};

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    totalPages: number;
    perPage: number;
    page: number;
  };
}

export const PaginatedResultGenericSchema = <T extends z.ZodType>(schema: T) =>
  z.object({
    data: schema.array(),
    meta: z.object({
      total: z.number(),
      totalPages: z.number(),
      perPage: z.number(),
      page: z.number(),
    }),
  });

export type FindManyWithPaginationInput<
  TDelegate extends PrismaDelegate,
  TArgs extends Parameters<TDelegate['findMany']>[0] = Parameters<
    TDelegate['findMany']
  >[0],
> = {
  pagination?: { page: number; perPage: number };
  findManyArgs: TArgs;
  modelDelegate: TDelegate;
};

// Extract return type from delegate's findMany method
export type ExtractModelType<TDelegate extends PrismaDelegate> = Awaited<
  ReturnType<TDelegate['findMany']>
>[number];

// Check if args has select property and extract appropriate type
export type ExtractResultType<
  TDelegate extends PrismaDelegate,
  TArgs extends Parameters<TDelegate['findMany']>[0],
> = TArgs extends { select: infer TSelect }
  ? TSelect extends Record<string, any>
    ? {
        [K in keyof TSelect]: TSelect[K] extends true
          ? K extends keyof ExtractModelType<TDelegate>
            ? ExtractModelType<TDelegate>[K]
            : never
          : TSelect[K] extends object
            ? any // Handle nested selects - could be expanded later
            : never;
      }
    : ExtractModelType<TDelegate>
  : ExtractModelType<TDelegate>;
