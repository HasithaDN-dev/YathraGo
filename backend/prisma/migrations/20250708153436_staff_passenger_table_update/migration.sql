/*
  Warnings:

  - You are about to drop the `StaffPassenger` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Child" DROP CONSTRAINT "Child_staffPassengerId_fkey";

-- DropForeignKey
ALTER TABLE "StaffPassenger" DROP CONSTRAINT "StaffPassenger_userId_fkey";

-- DropTable
DROP TABLE "StaffPassenger";

-- CreateTable
CREATE TABLE "Staff_Passenger" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nearbyCity" TEXT NOT NULL,
    "workLocation" TEXT NOT NULL,
    "workAddress" TEXT NOT NULL,
    "pickUpLocation" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,

    CONSTRAINT "Staff_Passenger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_Passenger_userId_key" ON "Staff_Passenger"("userId");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_staffPassengerId_fkey" FOREIGN KEY ("staffPassengerId") REFERENCES "Staff_Passenger"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff_Passenger" ADD CONSTRAINT "Staff_Passenger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
