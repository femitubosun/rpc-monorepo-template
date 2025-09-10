-- CreateEnum
CREATE TYPE "public"."AssetUploadStatus" AS ENUM ('PENDING', 'FAILED', 'PROCESSING', 'READY');

-- CreateEnum
CREATE TYPE "public"."AssetProvider" AS ENUM ('R2', 'S3', 'GCS', 'BUNNY');

-- CreateEnum
CREATE TYPE "public"."AssetType" AS ENUM ('IMAGE', 'VIDEO', 'PDF', 'DOCX', 'MARKDOWN');

-- CreateEnum
CREATE TYPE "public"."UploadMode" AS ENUM ('SINGLE', 'CHUNKED');

-- CreateTable
CREATE TABLE "public"."Asset" (
    "id" TEXT NOT NULL,
    "originalFilename" TEXT NOT NULL,
    "originalSize" BIGINT NOT NULL,
    "provider" "public"."AssetProvider" NOT NULL DEFAULT 'R2',
    "bucketKey" TEXT,
    "bucketName" TEXT,
    "uploadMode" "public"."UploadMode" NOT NULL DEFAULT 'SINGLE',
    "uploadId" TEXT,
    "url" TEXT,
    "metadata" JSONB,
    "status" "public"."AssetUploadStatus" NOT NULL DEFAULT 'PENDING',
    "type" "public"."AssetType" NOT NULL,
    "thumbnailUrl" TEXT,
    "optimizationRequested" BOOLEAN NOT NULL DEFAULT false,
    "optimizationConfig" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AssetChunk" (
    "id" TEXT NOT NULL,
    "status" "public"."AssetUploadStatus" NOT NULL DEFAULT 'PENDING',
    "index" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "size" BIGINT NOT NULL,
    "etag" TEXT,
    "uploadUrl" TEXT,
    "uploadSession" TEXT,
    "provider" "public"."AssetProvider" NOT NULL DEFAULT 'R2',
    "fileBucket" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssetChunk_assetId_idx" ON "public"."AssetChunk"("assetId");

-- CreateIndex
CREATE INDEX "AssetChunk_status_idx" ON "public"."AssetChunk"("status");

-- CreateIndex
CREATE INDEX "AssetChunk_uploadSession_idx" ON "public"."AssetChunk"("uploadSession");

-- CreateIndex
CREATE UNIQUE INDEX "AssetChunk_assetId_index_key" ON "public"."AssetChunk"("assetId", "index");

-- AddForeignKey
ALTER TABLE "public"."AssetChunk" ADD CONSTRAINT "AssetChunk_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "public"."Asset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
