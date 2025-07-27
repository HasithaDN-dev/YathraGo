-- CreateIndex
CREATE INDEX "Child_customerId_idx" ON "Child"("customerId");

-- CreateIndex
CREATE INDEX "Child_school_idx" ON "Child"("school");

-- CreateIndex
CREATE INDEX "Child_nearbyCity_idx" ON "Child"("nearbyCity");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE INDEX "Customer_registrationStatus_idx" ON "Customer"("registrationStatus");

-- CreateIndex
CREATE INDEX "Customer_status_idx" ON "Customer"("status");

-- CreateIndex
CREATE INDEX "Staff_Passenger_customerId_idx" ON "Staff_Passenger"("customerId");

-- CreateIndex
CREATE INDEX "Staff_Passenger_workLocation_idx" ON "Staff_Passenger"("workLocation");

-- CreateIndex
CREATE INDEX "Staff_Passenger_nearbyCity_idx" ON "Staff_Passenger"("nearbyCity");
