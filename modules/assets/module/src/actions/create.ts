import { CHUNK_SIZE, MULTIPART_THRESHOLD } from '@constants';
import { extractExtension, getContentType } from '@logic';
import module from '@module';
import { assetProviderManager } from '@template/asset-providers';
import { FullAssetOutput } from '@template/assets-defs';
import db from '@template/db';
import { zodToPrismaSelect } from '@template/db-utils';
import Env from '@template/env';
import { generateCuid } from '@template/string-utils';

module.registerHandlers({
  create: async ({ input, context, makeError }) => {
    const extension = extractExtension(input.originalFilename);
    const assetId = generateCuid();
    const fileSize = BigInt(input.originalSize);
    const isSmallFile = fileSize < MULTIPART_THRESHOLD;

    const providerName = 'R2';

    const provider = assetProviderManager.getProvider({
      provider: providerName,
      multipartThreshold: MULTIPART_THRESHOLD,
    });

    if (!provider) {
      throw makeError({
        message: `Provider ${providerName} not available`,
        type: 'INTERNAL',
      });
    }

    const filePath = `assets/${assetId}.${extension}`;

    if (isSmallFile) {
      await db.asset.create({
        data: {
          id: assetId,
          originalFilename: input.originalFilename,
          bucketKey: filePath,
          originalSize: fileSize,
          type: input.type,
          metadata: input.metadata || {},
          provider: providerName.toUpperCase() as 'R2' | 'BUNNY',
          status: 'PENDING',
        },
        select: { id: true },
      });

      const uploadResult = await provider.generateUploadUrl({
        fileName: filePath,
        contentType: getContentType(extension),
        fileSize: Number(fileSize),
      });

      if (!uploadResult) {
        throw makeError({
          message: 'Failed to generate upload URL',
          type: 'INTERNAL',
        });
      }

      const asset = await db.asset.findUniqueOrThrow({
        where: { id: assetId },
        select: zodToPrismaSelect(FullAssetOutput),
      });

      return {
        data: {
          ...asset,
          uploadUrl: uploadResult.uploadUrl,
          expiresAt: uploadResult.expiresAt,
        },
        context,
      };
    }

    const chunkCount = Math.ceil(Number(fileSize) / CHUNK_SIZE);
    const chunks = [];

    const multipartResult = await provider.initiateMultipartUpload({
      fileName: filePath,
      contentType: getContentType(extension),
      fileSize: Number(fileSize),
      chunkSize: CHUNK_SIZE,
    });

    if (!multipartResult) {
      throw makeError({
        message: 'Failed to initiate multipart upload',
        type: 'INTERNAL',
      });
    }

    const asset = await db.asset.create({
      data: {
        id: assetId,
        originalFilename: input.originalFilename,
        originalSize: fileSize,
        bucketKey: filePath,
        type: input.type,
        uploadMode: 'CHUNKED',
        uploadId: multipartResult.uploadId,
        metadata: input.metadata || {},
        provider: providerName,
        status: 'PENDING',
      },
      select: { id: true },
    });

    for (let i = 0; i < chunkCount; i++) {
      const isLastChunk = i === chunkCount - 1;
      const chunkSize = isLastChunk
        ? Number(fileSize) - i * CHUNK_SIZE
        : CHUNK_SIZE;

      const chunk = await db.assetChunk.create({
        data: {
          assetId: asset.id,
          index: i,
          total: chunkCount,
          size: chunkSize,
          status: 'PENDING',
          provider: providerName,
          fileBucket: providerName === 'R2' ? Env.R2_DEFAULT_APP_BUCKET : '',
          filePath: `${filePath}/chunk-${i}`,
          uploadSession: multipartResult.uploadId,
          uploadUrl: multipartResult.chunks[i]?.uploadUrl || '',
        },
      });

      chunks.push(chunk);
    }

    const fullAsset = await db.asset.findUniqueOrThrow({
      where: { id: assetId },
      select: zodToPrismaSelect(FullAssetOutput),
    });

    return {
      data: {
        ...fullAsset,
        uploadId: multipartResult.uploadId,
        expiresAt: multipartResult.expiresAt,
      },
      context,
    };
  },
});
