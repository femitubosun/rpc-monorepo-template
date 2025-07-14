-- DropIndex
DROP INDEX "Otp_userId_expiresAt_type_idx";

-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Otp_userId_expiresAt_type_isUsed_idx" ON "Otp"("userId", "expiresAt", "type", "isUsed");
