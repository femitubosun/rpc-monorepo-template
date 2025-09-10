import { existsSync, promises as fs } from 'node:fs';
import { join } from 'node:path';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffprobePath from '@ffprobe-installer/ffprobe';
import { APP_DIRS } from '@template/app-utils';
import { makeLogger } from '@template/logging';
import ffmpeg from 'fluent-ffmpeg';

ffmpeg.setFfmpegPath(ffmpegPath.path);
ffmpeg.setFfprobePath(ffprobePath.path);

const logger = makeLogger('VideoThumbnail');

async function cleanVideoBuffer(
  buffer: Buffer,
  originalFilename: string
): Promise<Buffer> {
  const bufferStart = buffer.subarray(0, 100).toString('hex');
  const bufferText = buffer.subarray(0, 1000).toString('utf8');

  logger.info('Buffer analysis', {
    originalFilename,
    bufferSize: buffer.length,
    startsWithDashes: bufferText.startsWith('---'),
    bufferStart: bufferStart.substring(0, 50),
    textPreview: bufferText.substring(0, 200).replace(/[^\x20-\x7E]/g, '.'),
  });

  if (
    bufferText.includes('Content-Disposition') ||
    bufferText.startsWith('---')
  ) {
    logger.warn(
      'Detected multipart form data, attempting to extract video content',
      { originalFilename }
    );

    const contentTypeIndex = buffer.indexOf('Content-Type:');
    if (contentTypeIndex !== -1) {
      const doubleNewline = buffer.indexOf('\r\n\r\n', contentTypeIndex);
      if (doubleNewline !== -1) {
        const videoStart = doubleNewline + 4;

        let videoEnd = buffer.length;
        const boundaryEnd = buffer.lastIndexOf('\r\n---');
        if (boundaryEnd > videoStart) {
          videoEnd = boundaryEnd;
        }

        const extractedBuffer = buffer.subarray(videoStart, videoEnd);
        logger.info('Extracted video from multipart data', {
          originalFilename,
          originalSize: buffer.length,
          extractedSize: extractedBuffer.length,
          reduction: buffer.length - extractedBuffer.length,
        });

        return extractedBuffer;
      }
    }

    logger.error('Failed to extract video from multipart data', {
      originalFilename,
    });
    throw new Error(
      'Video buffer contains multipart form data but could not extract video content'
    );
  }

  if (!bufferStart.startsWith('000000') && !bufferStart.startsWith('667479')) {
    logger.warn('Buffer does not start with expected MP4 signature', {
      originalFilename,
      actualStart: bufferStart.substring(0, 20),
    });
  }

  return buffer;
}

export interface GenerateThumbnailOptions {
  videoBuffer: Buffer;
  originalFilename: string;
  timestampSeconds?: number;
  maxWidth?: number;
  quality?: number;
}

export interface GenerateThumbnailResult {
  thumbnailBuffer: Buffer;
  thumbnailFilename: string;
  mimeType: string;
  tempPaths: {
    inputPath: string;
    outputPath: string;
  };
}

export async function generateThumbnail(
  options: GenerateThumbnailOptions
): Promise<GenerateThumbnailResult> {
  const {
    videoBuffer,
    originalFilename,
    timestampSeconds = 1,
    maxWidth = 720,
  } = options;

  if (!videoBuffer || videoBuffer.length === 0) {
    throw new Error('Video buffer is empty or invalid');
  }

  const cleanBuffer = await cleanVideoBuffer(videoBuffer, originalFilename);

  const tempDir = APP_DIRS.TMP_DIR;
  const videoId = Math.random().toString(36).substring(7);
  const inputPath = join(tempDir, `video_${videoId}.mp4`);
  const outputPath = join(tempDir, `thumb_${videoId}.jpg`);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(inputPath, cleanBuffer);

    const fileStats = await fs.stat(inputPath);
    logger.info('Generating thumbnail', {
      originalFilename,
      timestampSeconds,
      maxWidth,
      originalBufferSize: videoBuffer.length,
      cleanBufferSize: cleanBuffer.length,
      fileSize: fileStats.size,
    });

    const videoMeta = await new Promise<{
      format: { duration?: number; format_name?: string };
    }>((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          logger.error('FFprobe validation failed', {
            error: err,
            originalFilename,
            errorMessage: err?.message,
            errorCode: err?.code,
            errorSignal: err?.signal,
            inputPath,
            fileExists: existsSync(inputPath),
            ffprobePath: ffprobePath.path,
          });
          reject(new Error(`Invalid video format: ${err.message}`));
          return;
        }
        resolve(metadata);
      });
    });

    logger.info('Video metadata validated', {
      duration: videoMeta.format?.duration,
      format: videoMeta.format?.format_name,
    });

    const adjustedTimestamp = Math.min(
      timestampSeconds,
      (videoMeta.format?.duration || 10) - 0.5
    );

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [adjustedTimestamp],
          filename: `thumb_${videoId}.jpg`,
          folder: tempDir,
          size: `${maxWidth}x?`,
        })
        .outputOptions(['-y'])
        .on('start', (commandLine) => {
          logger.info('FFmpeg command started', { command: commandLine });
        })
        .on('end', () => {
          logger.info('Thumbnail generated successfully');
          resolve();
        })
        .on('error', (err, stdout, stderr) => {
          logger.error('FFmpeg thumbnail generation failed', {
            error: err.message,
            stdout,
            stderr,
            originalFilename,
            adjustedTimestamp,
            videoFormat: videoMeta.format?.format_name,
          });
          reject(new Error(`Thumbnail generation failed: ${err.message}`));
        });
    });

    const thumbnailBuffer = await fs.readFile(outputPath);

    const baseFilename = originalFilename.replace(/\.[^/.]+$/, '');
    const thumbnailFilename = `${baseFilename}_thumb.jpg`;

    return {
      thumbnailBuffer,
      thumbnailFilename,
      mimeType: 'image/jpeg',
      tempPaths: {
        inputPath,
        outputPath,
      },
    };
  } catch (error) {
    logger.error('Video thumbnail generation failed', {
      error,
      originalFilename,
    });
    throw error;
  } finally {
    try {
      logger.info('Debug: Preserving temp files for inspection', {
        originalFilename,
        inputPath: `Inspect video at: ${inputPath}`,
        outputPath: `Inspect thumbnail at: ${outputPath}`,
        note: 'Files will be preserved for debugging - cleanup manually if needed',
      });
    } catch (cleanupError) {
      logger.warn('Failed to cleanup temp files', cleanupError);
    }
  }
}

export async function cleanupThumbnailFiles(tempPaths: {
  inputPath: string;
  outputPath: string;
}): Promise<void> {
  try {
    await fs.unlink(tempPaths.inputPath).catch(() => {});
    await fs.unlink(tempPaths.outputPath).catch(() => {});
    logger.info('Thumbnail temp files cleaned up', tempPaths);
  } catch (error) {
    logger.warn('Failed to cleanup thumbnail temp files', { error, tempPaths });
  }
}

export async function getVideoDuration(videoBuffer: Buffer): Promise<number> {
  const tempDir = APP_DIRS.TMP_DIR;
  const videoId = Math.random().toString(36).substring(7);
  const inputPath = join(tempDir, `video_${videoId}.tmp`);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await fs.writeFile(inputPath, videoBuffer);

    return new Promise<number>((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (err, metadata) => {
        if (err) {
          logger.error('FFprobe failed', err);
          reject(err);
          return;
        }

        const duration = metadata.format.duration;
        if (!duration) {
          reject(new Error('Could not determine video duration'));
          return;
        }

        resolve(duration);
      });
    });
  } catch (error) {
    logger.error('Failed to get video duration', error);
    throw error;
  } finally {
    try {
      await fs.unlink(inputPath).catch(() => {});
    } catch (cleanupError) {
      logger.warn('Failed to cleanup temp file', cleanupError);
    }
  }
}
