/*
  Warnings:

  - The values [SIGNUP] on the enum `OtpTokenType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `TestModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OtpTokenType_new" AS ENUM ('AUTH');
ALTER TABLE "Otp" ALTER COLUMN "type" TYPE "OtpTokenType_new" USING ("type"::text::"OtpTokenType_new");
ALTER TYPE "OtpTokenType" RENAME TO "OtpTokenType_old";
ALTER TYPE "OtpTokenType_new" RENAME TO "OtpTokenType";
DROP TYPE "OtpTokenType_old";
COMMIT;

-- AlterTable
ALTER TABLE "Otp" ALTER COLUMN "type" SET DEFAULT 'AUTH';

-- DropTable
DROP TABLE "TestModel";

-- CreateIndex
CREATE INDEX "Otp_userId_expiresAt_idx" ON "Otp"("userId", "expiresAt");
