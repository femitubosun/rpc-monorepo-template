import {
  AbortMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Env from '@template/env';
import { AppError, makeError } from '@template/error';
import { makeLogger } from '@template/logging';
import type {
  AbortMultipartUploadOptions,
  CompleteMultipartUploadOptions,
  CompleteMultipartUploadResult,
  GenerateChunkUploadUrlOptions,
  GenerateChunkUploadUrlResult,
  InitiateMultipartUploadOptions,
  InitiateMultipartUploadResult,
  RequestDeleteObjectOptions,
  RequestGetObjectOptions,
  RequestUploadOptions,
  RequestVerifyObjectExistsOptions,
} from './__defs__';

export class R2Service {
  /**
   * Generates a presigned URL for uploading an object to R2 Bucket.
   * @param input {RequestUploadOptions} - Object containing parameters for constructing the request:
   *   - fileName: The name of the file to upload
   *   - contentType: The MIME type of the file
   * @returns {string} URL endpoint to use for this identity request
   */

  #s3Client: S3Client;
  #logger = makeLogger('R2Client');

  constructor() {
    this.#s3Client = new S3Client({
      endpoint: Env.R2_ENDPOINT_URL,
      credentials: {
        accessKeyId: Env.R2_ACCESS_KEY_ID,
        secretAccessKey: Env.R2_ACCESS_KEY,
      },
      region: 'auto',
    });
  }

  async generatePresignedUploadUrl(
    input: RequestUploadOptions
  ): Promise<string | null> {
    const { fileName } = input;

    try {
      const upload = new PutObjectCommand({
        Bucket: Env.R2_DEFAULT_APP_BUCKET,
        Key: fileName,
      });

      const presignedUrl = await getSignedUrl(this.#s3Client, upload, {
        expiresIn: 3600,
      });

      return presignedUrl;
    } catch (e) {
      this.#logger.error('Error generating presigned URL', e);

      return null;
    }
  }

  /**
   * Verifies an object from the R2 Bucket.
   * @param input {RequestVerifyObjectExistsOptions} - Object containing parameters for constructing the request:
   *   - objectKey: The key of the object to verify
   * @returns {boolean} Whether the object exists
   */
  async verifyObjectExists(
    input: RequestVerifyObjectExistsOptions
  ): Promise<boolean> {
    const { objectKey } = input;

    try {
      const verifyUpload = new HeadObjectCommand({
        Bucket: Env.R2_DEFAULT_APP_BUCKET,
        Key: objectKey,
      });

      await this.#s3Client.send(verifyUpload);

      return true;
    } catch (e) {
      this.#logger.error('Error verifying object exists', e);
      return false;
    }
  }

  /**
   * Deletes an object from the R2 Bucket.
   * @param input {RequestDeleteObjectOptions} - Object containing parameters for constructing the request:
   *   - objectKey: The key of the object to delete
   * @returns {boolean} Whether the object was deleted
   */
  async deleteObject(input: RequestDeleteObjectOptions): Promise<boolean> {
    const { objectKey } = input;

    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: Env.R2_DEFAULT_APP_BUCKET,
        Key: objectKey,
      });

      await this.#s3Client.send(deleteCommand);
      return true;
    } catch (e) {
      this.#logger.error('Error deleting object', e);
      return false;
    }
  }

  /**
   * Generates a presigned URL for getting an object from R2.
   * @param input {RequestGetObjectOptions} - Object containing parameters for constructing the request:
   *   - objectKey: The key of the object to get
   * @returns {string | null} The presigned URL or null if an error occurred
   */
  async getObjectUrl(input: RequestGetObjectOptions): Promise<string | null> {
    const { objectKey, range } = input;

    try {
      const getCommand = new GetObjectCommand({
        Bucket: Env.R2_DEFAULT_APP_BUCKET,
        Key: objectKey,
        Range: range,
      });

      const presignedUrl = await getSignedUrl(this.#s3Client, getCommand, {
        expiresIn: 900,
      });

      return presignedUrl;
    } catch (e) {
      this.#logger.error('Error getting object', e);
      return null;
    }
  }

  /**
   * @description Get object data as Buffer from R2 storage
   * @param input - Object containing key and optional bucket name
   * @returns Promise<Buffer> - The object data as a Buffer
   */
  async getObjectAsBuffer(input: {
    key: string;
    bucket: string;
  }): Promise<Buffer> {
    const { key: Key, bucket: Bucket } = input;

    try {
      const response = await this.#s3Client.send(
        new GetObjectCommand({
          Bucket: Bucket,
          Key,
        })
      );

      if (!response.Body) {
        throw makeError({
          message: `Object body not found: ${Key}`,
          type: 'INTERNAL',
        });
      }

      const chunks: Uint8Array[] = [];
      const reader = response.Body.transformToWebStream().getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          chunks.push(value);
        }
      }

      return Buffer.concat(chunks);
    } catch (error: any) {
      if (error.name === 'NoSuchKey' || error.name === 'NotFound') {
        this.#logger.error(`Asset not found in storage: ${Key}`, error);

        throw makeError({
          message: `Asset not found in storage: ${Key}`,
          type: 'INTERNAL',
        });
      }

      if (error.name === 'AccessDenied' || error.name === 'Forbidden') {
        this.#logger.error(`"Unable to access storage"`, error);

        throw makeError({
          message: 'Unable to access storage',
          type: 'INTERNAL',
        });
      }

      if (error instanceof AppError) {
        this.#logger.error(error.message, error);

        throw error;
      }

      this.#logger.error('Something went wrong with R2', error);

      throw makeError({
        message: `Storage error: ${error.message}`,
        type: 'INTERNAL',
      });
    }
  }

  /**
   * Initiates a multipart upload for large files
   * @param input - Object containing file name, content type, and optional bucket
   * @returns Promise<InitiateMultipartUploadResult> - Upload ID and metadata
   */
  async initiateMultipartUpload(
    input: InitiateMultipartUploadOptions
  ): Promise<InitiateMultipartUploadResult | null> {
    const { fileName, contentType, bucket = Env.R2_DEFAULT_APP_BUCKET } = input;

    try {
      const command = new CreateMultipartUploadCommand({
        Bucket: bucket,
        Key: fileName,
        ContentType: contentType,
      });

      const response = await this.#s3Client.send(command);

      if (!response.UploadId) {
        throw makeError({
          message: 'Failed to initiate multipart upload',
          type: 'INTERNAL',
        });
      }

      return {
        uploadId: response.UploadId,
        bucket: bucket,
        key: fileName,
      };
    } catch (error: any) {
      this.#logger.error('Error initiating multipart upload', error);
      return null;
    }
  }

  /**
   * Generates a presigned URL for uploading a specific chunk/part
   * @param input - Object containing file name, upload ID, part number, and optional bucket
   * @returns Promise<GenerateChunkUploadUrlResult | null> - Presigned URL for chunk upload
   */
  async generateChunkUploadUrl(
    input: GenerateChunkUploadUrlOptions
  ): Promise<GenerateChunkUploadUrlResult | null> {
    const {
      fileName,
      uploadId,
      partNumber,
      bucket = Env.R2_DEFAULT_APP_BUCKET,
    } = input;

    try {
      const command = new UploadPartCommand({
        Bucket: bucket,
        Key: fileName,
        UploadId: uploadId,
        PartNumber: partNumber,
      });

      const presignedUrl = await getSignedUrl(this.#s3Client, command, {
        expiresIn: 3600,
      });

      return {
        uploadUrl: presignedUrl,
        partNumber: partNumber,
      };
    } catch (error: any) {
      this.#logger.error('Error generating chunk upload URL', error);
      return null;
    }
  }

  /**
   * Completes a multipart upload by combining all uploaded parts
   * @param input - Object containing file name, upload ID, parts list, and optional bucket
   * @returns Promise<CompleteMultipartUploadResult | null> - Final object metadata
   */
  async completeMultipartUpload(
    input: CompleteMultipartUploadOptions
  ): Promise<CompleteMultipartUploadResult | null> {
    const {
      fileName,
      uploadId,
      parts,
      bucket = Env.R2_DEFAULT_APP_BUCKET,
    } = input;

    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: bucket,
        Key: fileName,
        UploadId: uploadId,
        MultipartUpload: {
          Parts: parts.map((part) => ({
            ETag: part.etag,
            PartNumber: part.partNumber,
          })),
        },
      });

      const response = await this.#s3Client.send(command);

      if (!response.Location || !response.ETag) {
        throw makeError({
          message: 'Failed to complete multipart upload',
          type: 'INTERNAL',
        });
      }

      return {
        location: response.Location,
        bucket: bucket,
        key: fileName,
        etag: response.ETag,
      };
    } catch (error: any) {
      this.#logger.error('Error completing multipart upload', error);
      return null;
    }
  }

  /**
   * Aborts a multipart upload and cleans up any uploaded parts
   * @param input - Object containing file name, upload ID, and optional bucket
   * @returns Promise<boolean> - Whether the abort was successful
   */
  async abortMultipartUpload(
    input: AbortMultipartUploadOptions
  ): Promise<boolean> {
    const { fileName, uploadId, bucket = Env.R2_DEFAULT_APP_BUCKET } = input;

    try {
      const command = new AbortMultipartUploadCommand({
        Bucket: bucket,
        Key: fileName,
        UploadId: uploadId,
      });

      await this.#s3Client.send(command);
      return true;
    } catch (error: any) {
      this.#logger.error('Error aborting multipart upload', error);
      return false;
    }
  }

  /**
   * Directly uploads an object to R2 storage without using presigned URLs
   * @param input - Object containing key, buffer, content type, and optional bucket
   * @returns Promise<boolean> - Whether the upload was successful
   */
  async putObject(input: {
    key: string;
    body: Buffer;
    contentType: string;
    bucket?: string;
  }): Promise<boolean> {
    const {
      key,
      body,
      contentType,
      bucket = Env.R2_DEFAULT_APP_BUCKET,
    } = input;

    try {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
      });

      await this.#s3Client.send(command);

      this.#logger.info('Object uploaded successfully', {
        key,
        bucket,
        contentType,
        size: body.length,
      });

      return true;
    } catch (error: any) {
      this.#logger.error('Error uploading object', {
        key,
        bucket,
        contentType,
        error,
      });
      return false;
    }
  }
}

import { R2Noop } from './r2.noop';

export const r2 = ['testing'].includes(Env.NODE_ENV)
  ? new R2Noop()
  : new R2Service();

export default r2;
