-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('OTP_PENDING', 'OTP_VERIFIED', 'CHILD_REGISTERED', 'STAFF_REGISTERED', 'FULLY_REGISTERED');

-- CreateEnum
CREATE TYPE "OtpPurpose" AS ENUM ('PHONE_VERIFICATION', 'PASSWORD_RESET', 'LOGIN');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('CUSTOMER', 'DRIVER');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Webuser" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Webuser_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "Driver" (
    "driver_id" SERIAL NOT NULL,
    "NIC" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "date_of_joining" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "driver_license_back_url" TEXT NOT NULL,
    "driver_license_front_url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "nic_front_pic_url" TEXT NOT NULL,
    "nice_back_pic_url" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "profile_picture_url" TEXT NOT NULL,
    "second_phone" TEXT NOT NULL,
    "vehicle_Reg_No" TEXT NOT NULL,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'OTP_PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("driver_id")
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
    "customer_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "address" TEXT,
    "profileImageUrl" TEXT,
    "emergencyContact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "registrationStatus" "RegistrationStatus" NOT NULL DEFAULT 'OTP_PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("customer_id")
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
    "relationship" TEXT NOT NULL,
    "NearbyCity" TEXT NOT NULL,
    "schoolLocation" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "childName" TEXT NOT NULL,
    "childImageUrl" TEXT,
    "pickUpAddress" TEXT NOT NULL,
    "customerId" INTEGER,

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
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "nearbyCity" TEXT NOT NULL,
    "workLocation" TEXT NOT NULL,
    "workAddress" TEXT NOT NULL,
    "pickUpLocation" TEXT NOT NULL,
    "pickupAddress" TEXT NOT NULL,

    CONSTRAINT "Staff_Passenger_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE INDEX "OtpCode_phone_userType_purpose_idx" ON "OtpCode"("phone", "userType", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "Webuser_email_key" ON "Webuser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Manager_email_key" ON "Manager"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_Passenger_customerId_key" ON "Staff_Passenger"("customerId");

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customer_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staff_Passenger" ADD CONSTRAINT "Staff_Passenger_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("customer_id") ON DELETE RESTRICT ON UPDATE CASCADE;
