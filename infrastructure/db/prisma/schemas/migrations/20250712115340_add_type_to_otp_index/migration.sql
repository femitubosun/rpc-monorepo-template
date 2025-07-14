-- DropIndex
DROP INDEX "Otp_userId_expiresAt_idx";

-- CreateIndex
CREATE INDEX "Otp_userId_expiresAt_type_idx" ON "Otp"("userId", "expiresAt", "type");
