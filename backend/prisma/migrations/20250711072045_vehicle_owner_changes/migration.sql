/*
  Warnings:

  - Added the required column `Address` to the `VehicleOwner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "ownerId" INTEGER;

-- AlterTable
ALTER TABLE "VehicleOwner" ADD COLUMN     "Address" TEXT NOT NULL,
ADD COLUMN     "company" TEXT;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "VehicleOwner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
