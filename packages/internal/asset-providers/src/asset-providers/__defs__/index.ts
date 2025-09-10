export interface AssetUploadOptions {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface AssetUploadResult {
  uploadUrl: string;
  expiresAt: string;
}

export interface AssetMultipartUploadOptions extends AssetUploadOptions {
  chunkSize?: number;
}

export interface AssetMultipartUploadResult {
  uploadId: string;
  chunks: AssetChunkUpload[];
  expiresAt: string;
}

export interface AssetChunkUpload {
  index: number;
  uploadUrl: string;
  size: number;
}

export interface AssetProvider {
  readonly name: string;
  readonly supportsMultipart: boolean;
  readonly multipartThreshold: BigInt;

  generateUploadUrl(
    options: AssetUploadOptions
  ): Promise<AssetUploadResult | null>;
  initiateMultipartUpload(
    options: AssetMultipartUploadOptions
  ): Promise<AssetMultipartUploadResult | null>;
  verifyFileExists(fileName: string): Promise<boolean>;
  deleteFile(fileName: string): Promise<boolean>;
  getFileUrl(fileName: string): Promise<string | null>;
}

export interface ProviderConfig {
  provider: 'R2' | 'BUNNY' | 'S3' | 'GCS';
  multipartThreshold?: BigInt;
}

export type ProviderFactory = (config: ProviderConfig) => AssetProvider | null;
