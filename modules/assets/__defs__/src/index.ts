import { AssetChunkSchema, AssetSchema } from '@template/prisma-defs';
import z from 'zod';

export const AssetOutput = AssetSchema.omit({
  metadata: true,
  optimizationConfig: true,
  originalSize: true,
  uploadId: true,
}).extend({
  metadata: z.any(),
  optimizationConfig: z.any(),
});

export const AssetChunkOutput = AssetChunkSchema.omit({
  assetId: true,
});

export const FullAssetOutput = AssetOutput;

export const CreateAssetInput = AssetSchema.pick({
  originalFilename: true,
  type: true,
  metadata: true,
}).extend({
  originalSize: z.number(),
});

export const CreateAssetOutput = FullAssetOutput.extend({
  uploadUrl: z.string().optional(),
  expiresAt: z.string().datetime(),
  uploadId: z.string().nullish(),
});
