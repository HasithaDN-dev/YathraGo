/*
  Warnings:

  - The primary key for the `Child` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `nearbyCity` on the `Child` table. All the data in the column will be lost.
  - You are about to drop the column `accountType` on the `User` table. All the data in the column will be lost.
  - Added the required column `NearbyCity` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Child" DROP CONSTRAINT "Child_pkey",
DROP COLUMN "id",
DROP COLUMN "nearbyCity",
ADD COLUMN     "NearbyCity" TEXT NOT NULL,
ADD COLUMN     "child_id" SERIAL NOT NULL,
ADD CONSTRAINT "Child_pkey" PRIMARY KEY ("child_id");

-- AlterTable
ALTER TABLE "User" DROP COLUMN "accountType";

-- AlterTable
ALTER TABLE "Webuser" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "AccountType";
