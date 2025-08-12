import { z } from 'zod';
// import { Prisma } from '@/infrastructure/prisma/generated';

export const PaginationInputSchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(10),
});

export type PaginationInput = z.infer<typeof PaginationInputSchema>;

export type BaseDelegate = {
  findMany: (args?: any) => Promise<any[]>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  findUnique: (args: any) => Promise<any | null>;
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  findFirst: (args?: any) => Promise<any | null>;
  create: (args: any) => Promise<any>;
  createMany: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  updateMany: (args: any) => Promise<any>;
  upsert: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
  deleteMany: (args?: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
  aggregate: (args?: any) => Promise<any>;
  groupBy: (args: any) => Promise<any[]>;
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
    data: schema,
    meta: z.object({
      total: z.number(),
      totalPages: z.number(),
      perPage: z.number(),
      page: z.number(),
    }),
  });

export type FindManyWithPaginationInput = {
  pagination?: { page: number; perPage: number };
  findManyArgs: {
    where?: any;
    select?: any;
  };
  modelDelegate: BaseDelegate;
};
