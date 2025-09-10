import { cleanupThumbnailFiles, generateThumbnail } from '@logic';
import module from '@module';
import db from '@template/db';
import Env from '@template/env';
import r2 from '@template/r2';

module.registerHandlers({
  process: async ({ context, input, makeError, logger }) => {
    logger.log(`Processing asset ${input.id}`);

    const asset = await db.asset.findUniqueOrThrow({
      where: {
        id: input.id,
      },
      select: {
        id: true,
        url: true,
        thumbnailUrl: true,
        bucketKey: true,
        bucketName: true,
        status: true,
        type: true,
      },
    });

    if (asset.status !== 'PROCESSING') {
      throw makeError({
        type: 'BAD_REQUEST',
        message: 'Cannot process assets that are already being processed',
      });
    }

    if (
      asset.type === 'DOCX' ||
      asset.type === 'MARKDOWN' ||
      asset.type === 'PDF'
    ) {
      await db.asset.update({
        where: {
          id: asset.id,
        },
        data: {
          status: 'READY',
        },
      });

      return {
        data: {
          ok: true,
        },
        context,
      };
    }

    if (asset.type === 'IMAGE') {
      await db.asset.update({
        where: {
          id: asset.id,
        },
        data: {
          thumbnailUrl: asset.url,
          status: 'READY',
        },
      });

      return {
        data: {
          ok: true,
        },
        context,
      };
    }

    try {
      logger.info('Starting video thumbnail generation', {
        assetId: asset.id,
        bucketKey: asset.bucketKey,
      });

      const videoBuffer = await r2.getObjectAsBuffer({
        key: asset.bucketKey!,
        bucket: asset.bucketName || Env.R2_DEFAULT_APP_BUCKET,
      });

      const thumbnailResult = await generateThumbnail({
        videoBuffer,
        originalFilename: asset.bucketKey!.split('/').pop() || 'video',
        timestampSeconds: 1,
        maxWidth: 720,
      });

      const thumbnailKey = asset.bucketKey!.replace(/\.[^/.]+$/, '_thumb.jpg');

      const uploadSuccess = await r2.putObject({
        key: thumbnailKey,
        body: thumbnailResult.thumbnailBuffer,
        contentType: thumbnailResult.mimeType,
        bucket: asset.bucketName || Env.R2_DEFAULT_APP_BUCKET,
      });

      await cleanupThumbnailFiles(thumbnailResult.tempPaths);

      if (!uploadSuccess) {
        throw makeError({
          type: 'INTERNAL',
          message: 'Failed to upload thumbnail to storage',
        });
      }

      const thumbnailUrl = `${Env.R2_BASE_URL}/${thumbnailKey}`;

      await db.asset.update({
        where: {
          id: asset.id,
        },
        data: {
          thumbnailUrl,
          status: 'READY',
        },
      });

      logger.info('Video thumbnail generation completed', {
        assetId: asset.id,
        thumbnailUrl,
      });

      return {
        data: {
          ok: true,
        },
        context,
      };
    } catch (error) {
      logger.error('Video thumbnail generation failed', {
        assetId: asset.id,
        error,
      });

      // Clean up temp files in case of error if they exist
      if (error instanceof Error && 'tempPaths' in error) {
        try {
          await cleanupThumbnailFiles(
            error.tempPaths as { inputPath: string; outputPath: string }
          );
        } catch (cleanupError) {
          logger.warn('Failed to cleanup temp files after error', {
            cleanupError,
          });
        }
      }

      await db.asset.update({
        where: {
          id: asset.id,
        },
        data: {
          status: 'FAILED',
        },
      });

      throw makeError({
        type: 'INTERNAL',
        message: 'Video processing failed',
      });
    }
  },
});
