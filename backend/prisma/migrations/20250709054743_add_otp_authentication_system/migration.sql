/*
  Warnings:

  - The primary key for the `Child` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `nearbyCity` on the `Child` table. All the data in the column will be lost.
  - The primary key for the `Staff_Passenger` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Staff_Passenger` table. All the data in the column will be lost.
  - Added the required column `NearbyCity` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'DRIVER');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('PHONE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET');

-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_staffPassengerId_fkey";

-- AlterTable
ALTER TABLE "Child" DROP CONSTRAINT "Child_pkey",
DROP COLUMN "id",
DROP COLUMN "nearbyCity",
ADD COLUMN     "NearbyCity" TEXT NOT NULL,
ADD COLUMN     "child_id" SERIAL NOT NULL,
ADD CONSTRAINT "Child_pkey" PRIMARY KEY ("child_id");

-- AlterTable
ALTER TABLE "Staff_Passenger" DROP CONSTRAINT "Staff_Passenger_pkey",
DROP COLUMN "id",
ADD COLUMN     "staff_id" SERIAL NOT NULL,
ADD CONSTRAINT "Staff_Passenger_pkey" PRIMARY KEY ("staff_id");

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Webuser" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userType" "UserType" NOT NULL,
    "purpose" "OtpPurpose" NOT NULL DEFAULT 'PHONE_VERIFICATION',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isUsed" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OtpCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpCode_phone_idx" ON "OtpCode"("phone");

-- CreateIndex
CREATE INDEX "OtpCode_code_idx" ON "OtpCode"("code");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_staffPassengerId_fkey" FOREIGN KEY ("staffPassengerId") REFERENCES "Staff_Passenger"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
