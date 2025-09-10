export interface S3Options {
  objectKey: string;
}

export interface RequestUploadOptions {
  fileName: string;
  contentType: string;
}

export interface RequestVerifyObjectExistsOptions extends S3Options {}

export interface RequestDeleteObjectOptions extends S3Options {}

export interface RequestGetObjectOptions {
  objectKey: string;
  range?: string;
}

// Multipart Upload Interfaces
export interface InitiateMultipartUploadOptions {
  fileName: string;
  contentType: string;
  bucket?: string;
}

export interface InitiateMultipartUploadResult {
  uploadId: string;
  bucket: string;
  key: string;
}

export interface GenerateChunkUploadUrlOptions {
  fileName: string;
  uploadId: string;
  partNumber: number;
  bucket?: string;
}

export interface GenerateChunkUploadUrlResult {
  uploadUrl: string;
  partNumber: number;
}

export interface CompleteMultipartUploadOptions {
  fileName: string;
  uploadId: string;
  parts: CompletedPart[];
  bucket?: string;
}

export interface CompletedPart {
  partNumber: number;
  etag: string;
}

export interface CompleteMultipartUploadResult {
  location: string;
  bucket: string;
  key: string;
  etag: string;
}

export interface AbortMultipartUploadOptions {
  fileName: string;
  uploadId: string;
  bucket?: string;
}
