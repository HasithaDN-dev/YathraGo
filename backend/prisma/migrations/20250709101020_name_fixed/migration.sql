/*
  Warnings:

  - The values [TYPE_SELECTED] on the enum `RegistrationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RegistrationStatus_new" AS ENUM ('OTP_PENDING', 'OTP_VERIFIED', 'CHILD_REGISTERED', 'STAFF_REGISTERED', 'FULLY_REGISTERED');
ALTER TABLE "User" ALTER COLUMN "registrationStatus" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "registrationStatus" TYPE "RegistrationStatus_new" USING ("registrationStatus"::text::"RegistrationStatus_new");
ALTER TYPE "RegistrationStatus" RENAME TO "RegistrationStatus_old";
ALTER TYPE "RegistrationStatus_new" RENAME TO "RegistrationStatus";
DROP TYPE "RegistrationStatus_old";
ALTER TABLE "User" ALTER COLUMN "registrationStatus" SET DEFAULT 'OTP_PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "firstName",
DROP COLUMN "lastName",
ADD COLUMN     "name" TEXT;
