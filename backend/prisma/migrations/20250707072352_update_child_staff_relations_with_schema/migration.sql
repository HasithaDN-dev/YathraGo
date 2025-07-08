/*
  Warnings:

  - You are about to drop the column `contact` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Driver` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Driver` table. All the data in the column will be lost.
  - Added the required column `NIC` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date_of_birth` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `driver_license_back_url` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `driver_license_front_url` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `first_name` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gender` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nic_front_pic_url` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nice_back_pic_url` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profile_picture_url` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `second_phone` to the `Driver` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vehicle_Reg_No` to the `Driver` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Driver" DROP COLUMN "contact",
DROP COLUMN "email",
DROP COLUMN "name",
ADD COLUMN     "NIC" TEXT NOT NULL,
ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "date_of_birth" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "date_of_joining" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "driver_license_back_url" TEXT NOT NULL,
ADD COLUMN     "driver_license_front_url" TEXT NOT NULL,
ADD COLUMN     "first_name" TEXT NOT NULL,
ADD COLUMN     "gender" TEXT NOT NULL,
ADD COLUMN     "last_name" TEXT NOT NULL,
ADD COLUMN     "nic_front_pic_url" TEXT NOT NULL,
ADD COLUMN     "nice_back_pic_url" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "profile_picture_url" TEXT NOT NULL,
ADD COLUMN     "second_phone" TEXT NOT NULL,
ADD COLUMN     "vehicle_Reg_No" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "permissions" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "department" TEXT,
    "level" TEXT NOT NULL DEFAULT 'JUNIOR',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "manufactureYear" INTEGER NOT NULL,
    "registrationNumber" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "route" TEXT[],
    "no_of_seats" INTEGER NOT NULL,
    "air_conditioned" BOOLEAN NOT NULL DEFAULT false,
    "assistant" BOOLEAN NOT NULL DEFAULT false,
    "rear_picture_url" TEXT NOT NULL,
    "front_picture_url" TEXT NOT NULL,
    "side_picture_url" TEXT NOT NULL,
    "inside_picture_url" TEXT NOT NULL,
    "revenue_license_url" TEXT NOT NULL,
    "insurance_front_url" TEXT NOT NULL,
    "insurance_back_url" TEXT NOT NULL,
    "vehicle_reg_url" TEXT NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BackupDriver" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "vehicle_Reg_No" TEXT NOT NULL,
    "NIC" TEXT NOT NULL,

    CONSTRAINT "BackupDriver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Absence_Child" (
    "absent_id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Absence_Child_pkey" PRIMARY KEY ("absent_id")
);

-- CreateTable
CREATE TABLE "DriverNotification" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriverNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyPayment" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "month" TEXT NOT NULL,
    "Status" TEXT NOT NULL DEFAULT 'Pending',

    CONSTRAINT "MonthlyPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentBalance" (
    "id" SERIAL NOT NULL,
    "month" TEXT NOT NULL,
    "amountDue" DOUBLE PRECISION NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "PaymentBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffEmergency" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "OccurrenceDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffEmergency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChildEmergency" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "OccurrenceDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChildEmergency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoundedBackupDrivers" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "FoundedBackupDrivers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VehicleOwner" (
    "id" SERIAL NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "VehicleOwner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "user_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "profileImageUrl" TEXT NOT NULL,
    "emergencyContact" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Complaints" (
    "complaint_id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Complaints_pkey" PRIMARY KEY ("complaint_id")
);

-- CreateTable
CREATE TABLE "Inquires" (
    "inquiry_id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Inquires_pkey" PRIMARY KEY ("inquiry_id")
);

-- CreateTable
CREATE TABLE "Absence_Staff" (
    "absent_id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Absence_Staff_pkey" PRIMARY KEY ("absent_id")
);

-- CreateTable
CREATE TABLE "Ratings_and_Reviews" (
    "review_id" SERIAL NOT NULL,
    "review" TEXT NOT NULL,
    "ratings" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ratings_and_Reviews_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "Child" (
    "child_id" SERIAL NOT NULL,
    "staffPassengerId" INTEGER,
    "relationship" TEXT NOT NULL,
    "NearbyCity" TEXT NOT NULL,
    "schoolLocation" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "childImageUrl" TEXT NOT NULL,
    "pickUpAddress" TEXT NOT NULL,

    CONSTRAINT "Child_pkey" PRIMARY KEY ("child_id")
);

-- CreateTable
CREATE TABLE "Child_Trip" (
    "childTrip_id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pickUp" TEXT NOT NULL,
    "dropOff" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Child_Trip_pkey" PRIMARY KEY ("childTrip_id")
);

-- CreateTable
CREATE TABLE "Staff_Passenger" (
    "staff_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "nearbyCity" TEXT NOT NULL,
    "workLocation" TEXT NOT NULL,
    "workAddress" TEXT NOT NULL,
    "pickUpLocation" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,

    CONSTRAINT "Staff_Passenger_pkey" PRIMARY KEY ("staff_id")
);

-- CreateTable
CREATE TABLE "Staff_Trip" (
    "staffTrip_id" SERIAL NOT NULL,
    "pickUpLocation" TEXT NOT NULL,
    "dropOffLocation" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_Trip_pkey" PRIMARY KEY ("staffTrip_id")
);

-- CreateTable
CREATE TABLE "Child_Assign_To" (
    "assign_id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Child_Assign_To_pkey" PRIMARY KEY ("assign_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_email_key" ON "Manager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_Passenger_email_key" ON "Staff_Passenger"("email");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_staffPassengerId_fkey" FOREIGN KEY ("staffPassengerId") REFERENCES "Staff_Passenger"("staff_id") ON DELETE SET NULL ON UPDATE CASCADE;
