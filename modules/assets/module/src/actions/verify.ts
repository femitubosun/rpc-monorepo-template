import { getPublicUrl } from '@logic';
import module from '@module';
import { scheduleAction } from '@template/action';
import AssetsActions from '@template/assets-action-defs';
import { FullAssetOutput } from '@template/assets-defs';
import db from '@template/db';
import { zodToPrismaSelect } from '@template/db-utils';
import Env from '@template/env';
import r2 from '@template/r2';

module.registerHandlers({
  verify: async ({ input, context, makeError, logger }) => {
    const { id } = input;

    const found = await db.asset.findUniqueOrThrow({
      where: { id, deletedAt: null },
      select: {
        id: true,
        bucketKey: true,
        uploadMode: true,
        uploadId: true,
      },
    });

    if (!found.bucketKey) {
      throw makeError({
        type: 'INTERNAL',
        message: 'Asset bucket key not found',
      });
    }

    if (found.uploadMode === 'SINGLE') {
      const objectExists = await r2.verifyObjectExists({
        objectKey: found.bucketKey,
      });

      const r2Public = `${Env.R2_BASE_URL}/${found.bucketKey}`;

      if (!objectExists) {
        const asset = await db.asset.update({
          where: { id },
          data: {
            status: 'FAILED',
          },
          select: zodToPrismaSelect(FullAssetOutput),
        });

        return {
          data: asset,
          context,
        };
      }

      const asset = await db.asset.update({
        where: { id },
        data: {
          status: 'PROCESSING',
          url: r2Public,
        },
        select: zodToPrismaSelect(FullAssetOutput),
      });

      await scheduleAction(AssetsActions.process, {
        input: {
          id: asset.id,
        },
        context,
      });

      return {
        data: asset,
        context,
      };
    } else {
      const chunks = await db.assetChunk.findMany({
        where: {
          assetId: id,
          status: 'READY',
        },
        orderBy: { index: 'asc' },
      });

      if (chunks.length === 0) {
        throw makeError({
          type: 'INTERNAL',
          message: 'No completed chunks found for asset',
        });
      }

      const totalChunks = await db.assetChunk.count({
        where: { assetId: id },
      });

      if (chunks.length !== totalChunks) {
        throw makeError({
          type: 'INTERNAL',
          message: `Only ${chunks.length} of ${totalChunks} chunks are ready`,
        });
      }

      if (!found.uploadId) {
        throw makeError({
          type: 'INTERNAL',
          message: 'Upload ID not found for asset',
        });
      }

      const parts = chunks.map((chunk) => ({
        partNumber: chunk.index + 1,
        etag: chunk.etag || '',
      }));

      const completeResult = await r2.completeMultipartUpload({
        uploadId: found.uploadId,
        parts,
        fileName: found.bucketKey,
      });

      if (!completeResult) {
        throw makeError({
          type: 'INTERNAL',
          message: 'Failed to complete multipart upload',
        });
      }

      const asset = await db.asset.update({
        where: { id },
        data: {
          status: 'PROCESSING',
          url: getPublicUrl(found.bucketKey),
        },
        select: zodToPrismaSelect(FullAssetOutput),
      });

      logger.info(
        `We should be scheduling the action for processing at this point.`
      );

      await scheduleAction(AssetsActions.process, {
        input: {
          id: asset.id,
        },
        context,
      });

      return {
        data: asset,
        context,
      };
    }
  },
});
