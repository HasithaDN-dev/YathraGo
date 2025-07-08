/*
  Warnings:

  - The primary key for the `Child` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `NearbyCity` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `child_id` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Staff_Passenger` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nearbyCity` to the `Child` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHILD', 'STAFF');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('OTP_PENDING', 'OTP_VERIFIED', 'TYPE_SELECTED', 'CHILD_REGISTERED', 'STAFF_REGISTERED');

-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_staffPassengerId_fkey";

-- AlterTable
ALTER TABLE "Child" DROP CONSTRAINT "Child_pkey",
DROP COLUMN "NearbyCity",
DROP COLUMN "child_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "nearbyCity" TEXT NOT NULL,
ADD COLUMN     "userId" INTEGER,
ALTER COLUMN "childImageUrl" DROP NOT NULL,
ADD CONSTRAINT "Child_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "role",
ADD COLUMN     "accountType" "AccountType",
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'OTP_PENDING',
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

-- DropTable
DROP TABLE "Staff_Passenger";

-- CreateTable
CREATE TABLE "StaffPassenger" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nearbyCity" TEXT NOT NULL,
    "workLocation" TEXT NOT NULL,
    "workAddress" TEXT NOT NULL,
    "pickUpLocation" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,

    CONSTRAINT "StaffPassenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffPassenger_userId_key" ON "StaffPassenger"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_staffPassengerId_fkey" FOREIGN KEY ("staffPassengerId") REFERENCES "StaffPassenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffPassenger" ADD CONSTRAINT "StaffPassenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
