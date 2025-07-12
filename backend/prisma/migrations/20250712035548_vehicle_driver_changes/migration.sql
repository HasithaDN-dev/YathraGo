-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "driverId" INTEGER,
ALTER COLUMN "revenue_license_url" DROP NOT NULL,
ALTER COLUMN "insurance_front_url" DROP NOT NULL,
ALTER COLUMN "insurance_back_url" DROP NOT NULL,
ALTER COLUMN "vehicle_reg_url" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("driver_id") ON DELETE SET NULL ON UPDATE CASCADE;
