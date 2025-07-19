/*
  Warnings:

  - The values [CHILD_REGISTERED,STAFF_REGISTERED] on the enum `RegistrationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `registrationStatus` on the `Customer` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RegistrationStatus_new" AS ENUM ('OTP_PENDING', 'OTP_VERIFIED', 'HAVING_A_PROFILE', 'FULLY_REGISTERED', 'CUSTOMER_REGISTERED');
ALTER TABLE "Customer" ALTER COLUMN "registrationStatus" DROP DEFAULT;
ALTER TABLE "Driver" ALTER COLUMN "registrationStatus" DROP DEFAULT;
ALTER TABLE "Driver" ALTER COLUMN "registrationStatus" TYPE "RegistrationStatus_new" USING ("registrationStatus"::text::"RegistrationStatus_new");
ALTER TABLE "Customer" ALTER COLUMN "RegistrationStatus" TYPE "RegistrationStatus_new" USING ("RegistrationStatus"::text::"RegistrationStatus_new");
ALTER TYPE "RegistrationStatus" RENAME TO "RegistrationStatus_old";
ALTER TYPE "RegistrationStatus_new" RENAME TO "RegistrationStatus";
DROP TYPE "RegistrationStatus_old";
ALTER TABLE "Driver" ALTER COLUMN "registrationStatus" SET DEFAULT 'OTP_PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "registrationStatus",
ADD COLUMN     "RegistrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'OTP_PENDING';