/*
  Warnings:

  - The primary key for the `Child` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `NearbyCity` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `child_id` on the `Child` table. All the data in the column will be lost.
  - The primary key for the `Staff_Passenger` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `contact` on the `Staff_Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Staff_Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Staff_Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `staff_id` on the `Staff_Passenger` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `Staff_Passenger` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nearbyCity` to the `Child` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Staff_Passenger` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('CHILD', 'STAFF');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('OTP_PENDING', 'OTP_VERIFIED', 'TYPE_SELECTED', 'CHILD_REGISTERED', 'STAFF_REGISTERED');

-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_staffPassengerId_fkey";

-- DropIndex
DROP INDEX "Staff_Passenger_email_key";

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
ALTER TABLE "Staff_Passenger" DROP CONSTRAINT "Staff_Passenger_pkey",
DROP COLUMN "contact",
DROP COLUMN "email",
DROP COLUMN "name",
DROP COLUMN "staff_id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "Staff_Passenger_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password",
DROP COLUMN "role",
DROP COLUMN "username",
ADD COLUMN     "accountType" "AccountType",
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'OTP_PENDING',
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Webuser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webuser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Webuser_email_key" ON "Webuser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_Passenger_userId_key" ON "Staff_Passenger"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_staffPassengerId_fkey" FOREIGN KEY ("staffPassengerId") REFERENCES "Staff_Passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff_Passenger" ADD CONSTRAINT "Staff_Passenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
