export interface S3Options {
  objectKey: string;
}

export interface RequestUploadOptions {
  fileName: string;
  contentType: string;
}

export interface RequestVerifyObjectExistsOptions
  extends S3Options {}

export interface RequestDeleteObjectOptions
  extends S3Options {}

export interface RequestGetObjectOptions {
  objectKey: string;
  range?: string;
}
