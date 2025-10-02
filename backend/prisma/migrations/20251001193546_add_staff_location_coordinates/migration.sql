/*
  Warnings:

  - You are about to drop the column `childName` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Customer` table. All the data in the column will be lost.
  - Added the required column `childFirstName` to the `Child` table without a default value. This is not possible if the table is not empty.
  - Added the required column `childLastName` to the `Child` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Male', 'Female', 'Unspecified');

-- AlterTable
ALTER TABLE "Child" DROP COLUMN "childName",
ADD COLUMN     "childFirstName" TEXT NOT NULL,
ADD COLUMN     "childLastName" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'Unspecified';

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "name",
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'Unspecified',
ADD COLUMN     "lastName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Staff_Passenger" ADD COLUMN     "pickupLatitude" DOUBLE PRECISION,
ADD COLUMN     "pickupLongitude" DOUBLE PRECISION,
ADD COLUMN     "workLatitude" DOUBLE PRECISION,
ADD COLUMN     "workLongitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Vehicle" ALTER COLUMN "registrationNumber" DROP NOT NULL;
