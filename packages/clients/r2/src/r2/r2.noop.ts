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

export class R2Noop {
  #logger = makeLogger('R2Noop');

  async generatePresignedUploadUrl(
    input: RequestUploadOptions
  ): Promise<string | null> {
    this.#logger.info('Mock: Generating presigned upload URL', input);
    return `https://mock-r2.example.com/upload/${input.fileName}`;
  }

  async verifyObjectExists(
    input: RequestVerifyObjectExistsOptions
  ): Promise<boolean> {
    this.#logger.info('Mock: Verifying object exists', input);
    return true;
  }

  async deleteObject(input: RequestDeleteObjectOptions): Promise<boolean> {
    this.#logger.info('Mock: Deleting object', input);
    return true;
  }

  async getObjectUrl(input: RequestGetObjectOptions): Promise<string | null> {
    this.#logger.info('Mock: Getting object URL', input);
    return `https://mock-r2.example.com/get/${input.objectKey}`;
  }

  async getObjectAsBuffer(input: {
    key: string;
    bucket: string;
  }): Promise<Buffer> {
    this.#logger.info('Mock: Getting object as buffer', input);
    return Buffer.from(`mock-video-content-for-${input.key}`);
  }

  async initiateMultipartUpload(
    input: InitiateMultipartUploadOptions
  ): Promise<InitiateMultipartUploadResult | null> {
    this.#logger.info('Mock: Initiating multipart upload', input);
    return {
      uploadId: `mock-upload-${Date.now()}`,
      bucket: input.bucket || 'mock-bucket',
      key: input.fileName,
    };
  }

  async generateChunkUploadUrl(
    input: GenerateChunkUploadUrlOptions
  ): Promise<GenerateChunkUploadUrlResult | null> {
    this.#logger.info('Mock: Generating chunk upload URL', input);
    return {
      uploadUrl: `https://mock-r2.example.com/chunk/${input.fileName}/${input.partNumber}`,
      partNumber: input.partNumber,
    };
  }

  async completeMultipartUpload(
    input: CompleteMultipartUploadOptions
  ): Promise<CompleteMultipartUploadResult | null> {
    this.#logger.info('Mock: Completing multipart upload', input);
    return {
      location: `https://mock-r2.example.com/${input.fileName}`,
      bucket: input.bucket || 'mock-bucket',
      key: input.fileName,
      etag: `"mock-etag-${Date.now()}"`,
    };
  }

  async abortMultipartUpload(
    input: AbortMultipartUploadOptions
  ): Promise<boolean> {
    this.#logger.info('Mock: Aborting multipart upload', input);
    return true;
  }

  async putObject(input: {
    key: string;
    body: Buffer;
    contentType: string;
    bucket?: string;
  }): Promise<boolean> {
    this.#logger.info('Mock: Putting object', {
      key: input.key,
      contentType: input.contentType,
      bucket: input.bucket,
      size: input.body.length,
    });
    return true;
  }
}
