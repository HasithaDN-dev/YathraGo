import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsDto } from './dto/payment-filter.dto';
import { CreateMultipleChildPaymentsDto } from './dto/create-payment.dto';
import { SubmitMonthsForPaymentDto } from './dto/submit-payment.dto';
import { ChildPaymentStatus } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  // Fetch all records
  findAll() {
    return this.prisma.childPayment.findMany();
  }

  findByDriver(driverId: number) {
    return this.prisma.childPayment.findMany({
      where: {
        driverId: driverId,
      },
      // include: {
      //   child: true,
      //   customer: true,
      //   driver: true,
      // },
      orderBy: { paymentYear: 'desc' },
    });
  }

  async getPaymentsForDriver(driverId: number): Promise<TransactionsDto[]> {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JS months start from 0
    const currentYear = currentDate.getFullYear();

    const payments = await this.prisma.childPayment.findMany({
      where: {
        driverId,
        paymentMonth: currentMonth,
        paymentYear: currentYear,
      },
      include: {
        Child: true,
        Customer: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Map to DTO format (optional, if you want to clean up or rename fields)
    return payments.map((p) => ({
      childId: p.childId,
      childName: p.Child?.childFirstName, // optional
      paymentDate: p.updatedAt, // or dueDate / firstUsageDate
      paymentMethod: p.paymentMethod ?? undefined,
      transactionRef: p.transactionRef ?? undefined,
      paymentAmount:
        p.paymentStatus === 'PAID' ? p.amountPaid : p.carryForwardDue,
      paymentStatus: p.paymentStatus,
    }));
  }

  async createMultiplePayments(dto: CreateMultipleChildPaymentsDto) {
    // 1. Map the DTOs to the Prisma createMany format
    const recordsToCreate = dto.records.map((record) => {
      return {
        ...record,
        // 2. Set defaults for any optional fields if not provided
        finalPrice: record.finalPrice ?? record.baseMonthlyPrice,
        paymentStatus: record.paymentStatus ?? ChildPaymentStatus.NOT_DUE,
        updatedAt: new Date(), // Manually set updatedAt since it's not auto-updating in your schema
        // All other fields are taken from the 'record' object
      };
    });

    try {
      // 3. Use createMany for high-performance bulk insert
      const result = await this.prisma.childPayment.createMany({
        data: recordsToCreate,
        skipDuplicates: true, // IMPORTANT: This will skip any records that violate
        // your @@unique([childId, paymentYear, paymentMonth]) constraint
      });
      return result; // Returns { count: number_of_records_created }
    } catch (error) {
      console.error('Error in createMultiplePayments:', error);
      // This might fail if, for example, a childId or driverId doesn't exist
      throw new BadRequestException(
        'Could not create payment records. Check if all Child, Driver, and Customer IDs are valid.',
      );
    }
  }

  // src/transactions/transactions.service.ts
  // ... (inside TransactionsService class)

  /**
   * Get the next 5 months with payment status for a child.
   * Returns 5 months starting from the month after the last paid month,
   * or from the current month if no paid records exist.
   * Includes the current month's status in the response.
   */
  async getNextFiveMonthsWithStatus(childId: number) {
    // Get current date
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // 1. Find the last paid record
    const lastPaidRecord = await this.prisma.childPayment.findFirst({
      where: {
        childId: childId,
        paymentStatus: 'PAID',
      },
      orderBy: [{ paymentYear: 'desc' }, { paymentMonth: 'desc' }],
      select: {
        paymentMonth: true,
        paymentYear: true,
      },
    });

    // 2. Determine starting month for the 5-month array
    let startMonth: number;
    let startYear: number;

    if (lastPaidRecord) {
      // Start from the month AFTER the last paid month
      startMonth = lastPaidRecord.paymentMonth + 1;
      startYear = lastPaidRecord.paymentYear;

      if (startMonth > 12) {
        startMonth = 1;
        startYear++;
      }
    } else {
      // No paid records - start from current month
      startMonth = currentMonth;
      startYear = currentYear;
    }

    // 3. Build array of next 5 months
    const monthsArray: { year: number; month: number }[] = [];
    let month = startMonth;
    let year = startYear;

    for (let i = 0; i < 5; i++) {
      monthsArray.push({ year, month });

      // Move to next month
      month++;
      if (month > 12) {
        month = 1;
        year++;
      }
    }

    // 4. Fetch existing payment records for these 5 months
    const existingRecords = await this.prisma.childPayment.findMany({
      where: {
        childId: childId,
        OR: monthsArray.map((m) => ({
          paymentYear: m.year,
          paymentMonth: m.month,
        })),
      },
      select: {
        paymentMonth: true,
        paymentYear: true,
        paymentStatus: true,
      },
    });

    // 5. Update status for months between last paid and current month
    if (lastPaidRecord) {
      const monthsSinceLastPaid =
        (currentYear - lastPaidRecord.paymentYear) * 12 +
        (currentMonth - lastPaidRecord.paymentMonth);

      // Only update if gap is between 0 and 100 months (safety cap)
      if (monthsSinceLastPaid >= 0 && monthsSinceLastPaid <= 100) {
        // Determine status based on gap:
        // 0-1 months: OVERDUE
        // 2-3 months: GRACE_PERIOD
        // >3 months: CANCELLED
        let newStatus: ChildPaymentStatus;
        if (monthsSinceLastPaid <= 1) {
          newStatus = ChildPaymentStatus.OVERDUE;
        } else if (monthsSinceLastPaid <= 3) {
          newStatus = ChildPaymentStatus.GRACE_PERIOD;
        } else {
          newStatus = ChildPaymentStatus.CANCELLED;
        }

        // Build list of months to update (from last paid +1 to current month)
        const monthsToUpdate: { year: number; month: number }[] = [];
        let tempMonth = lastPaidRecord.paymentMonth;
        let tempYear = lastPaidRecord.paymentYear;

        for (let i = 1; i <= monthsSinceLastPaid; i++) {
          tempMonth++;
          if (tempMonth > 12) {
            tempMonth = 1;
            tempYear++;
          }
          monthsToUpdate.push({ year: tempYear, month: tempMonth });
        }

        // Update database records (only non-PAID and non-CANCELLED)
        if (monthsToUpdate.length > 0) {
          // First, try to update existing records
          await this.prisma.childPayment.updateMany({
            where: {
              childId: childId,
              OR: monthsToUpdate.map((m) => ({
                paymentYear: m.year,
                paymentMonth: m.month,
              })),
              paymentStatus: {
                notIn: [ChildPaymentStatus.PAID, ChildPaymentStatus.CANCELLED],
              },
            },
            data: {
              paymentStatus: newStatus,
              updatedAt: new Date(),
            },
          });

          // Now create missing records for months that don't exist yet
          // Get child's ride request info for creating new records
          const rideRequest = await this.prisma.childRideRequest.findFirst({
            where: { childId: childId, status: 'Assigned' },
            orderBy: { AssignedDate: 'desc' },
            select: { Amount: true, driverId: true },
          });

          if (rideRequest && rideRequest.driverId) {
            const childData = await this.prisma.child.findUnique({
              where: { child_id: childId },
              select: { customerId: true },
            });

            if (childData && childData.customerId !== null) {
              // Check which months don't exist yet
              const existingMonthsInRange =
                await this.prisma.childPayment.findMany({
                  where: {
                    childId: childId,
                    OR: monthsToUpdate.map((m) => ({
                      paymentYear: m.year,
                      paymentMonth: m.month,
                    })),
                  },
                  select: {
                    paymentYear: true,
                    paymentMonth: true,
                  },
                });

              const existingMonthsSet = new Set(
                existingMonthsInRange.map(
                  (m) => `${m.paymentYear}-${m.paymentMonth}`,
                ),
              );

              const monthsToCreate = monthsToUpdate.filter(
                (m) => !existingMonthsSet.has(`${m.year}-${m.month}`),
              );

              // Create missing payment records with calculated status
              if (monthsToCreate.length > 0) {
                const newRecords = monthsToCreate.map((m) => ({
                  childId: childId,
                  driverId: rideRequest.driverId,
                  customerId: childData.customerId as number,
                  paymentMonth: m.month,
                  paymentYear: m.year,
                  baseMonthlyPrice: rideRequest.Amount ?? 0,
                  finalPrice: rideRequest.Amount ?? 0,
                  paymentStatus: newStatus,
                  updatedAt: new Date(),
                  dueDate: new Date(m.year, m.month - 1, 5),
                  gracePeriodEndDate: new Date(m.year, m.month - 1, 10),
                }));

                await this.prisma.childPayment.createMany({
                  data: newRecords,
                  skipDuplicates: true,
                });
              }
            }
          }

          // Re-fetch to get updated statuses
          const updatedRecords = await this.prisma.childPayment.findMany({
            where: {
              childId: childId,
              OR: monthsArray.map((m) => ({
                paymentYear: m.year,
                paymentMonth: m.month,
              })),
            },
            select: {
              paymentMonth: true,
              paymentYear: true,
              paymentStatus: true,
            },
          });

          // Replace existingRecords with updated data
          existingRecords.length = 0;
          existingRecords.push(...updatedRecords);
        }
      }
    }

    // 6. Build status map for quick lookup
    const statusMap = new Map<string, string>();
    existingRecords.forEach((record) => {
      const key = `${record.paymentYear}-${record.paymentMonth}`;
      statusMap.set(key, record.paymentStatus);
    });

    // 7. Create final response array with status for each month
    const monthsResponse = monthsArray.map((m) => {
      const key = `${m.year}-${m.month}`;
      const status = statusMap.get(key) || 'NOT_CREATED';

      return {
        year: m.year,
        month: m.month,
        paymentStatus: status,
      };
    });

    // 8. Get current month's status separately
    const currentMonthKey = `${currentYear}-${currentMonth}`;
    const currentMonthStatus = statusMap.get(currentMonthKey) || 'NOT_CREATED';

    // 9. Return response with months array and current month status
    return {
      months: monthsResponse,
      currentMonth: {
        year: currentYear,
        month: currentMonth,
        paymentStatus: currentMonthStatus,
      },
    };
  }

  async submitMonthsForPhysicalPayment(dto: SubmitMonthsForPaymentDto) {
    const { childId, months } = dto;

    // 1. Find all existing records that match the childId AND
    //    are in the 'months' array from the request body.
    const existingRecords = await this.prisma.childPayment.findMany({
      where: {
        childId: childId,
        OR: months.map((m) => ({
          paymentYear: m.year,
          paymentMonth: m.month,
        })),
      },
      select: {
        id: true,
        paymentStatus: true,
        paymentMonth: true,
        paymentYear: true,
      },
    });

    // 2. Separate the REQUESTED months into "To Update" and "To Create"
    const existingRecordMap = new Map<
      string,
      { id: number; paymentStatus: ChildPaymentStatus }
    >();
    existingRecords.forEach((rec) => {
      existingRecordMap.set(`${rec.paymentYear}-${rec.paymentMonth}`, rec);
    });

    const recordsToUpdate: {
      id: number;
      paymentStatus: ChildPaymentStatus;
    }[] = [];
    const monthsToCreate: { year: number; month: number }[] = [];

    // We loop ONLY through the months from the request body
    for (const month of months) {
      const key = `${month.year}-${month.month}`;
      const existingRecord = existingRecordMap.get(key);

      if (existingRecord) {
        // This month exists, so add it to the update list
        recordsToUpdate.push(existingRecord);
      } else {
        // This month does not exist, so add it to the create list
        monthsToCreate.push(month);
      }
    }

    // 3. Validate the "To Update" list
    const invalidRecords = recordsToUpdate.filter(
      (rec) =>
        rec.paymentStatus === 'PAID' ||
        rec.paymentStatus === 'CANCELLED' ||
        rec.paymentStatus === 'AWAITING_CONFIRMATION',
    );

    if (invalidRecords.length > 0) {
      throw new BadRequestException(
        'Cannot proceed. Some selected months are already paid, cancelled, or are already awaiting confirmation.',
      );
    }

    let createdCount = 0;
    let updatedCount = 0;

    // 4. Handle the "To Create" list
    if (monthsToCreate.length > 0) {
      // 4a. Fetch required data ONCE
      const rideRequest = await this.prisma.childRideRequest.findFirst({
        where: { childId: childId, status: 'Assigned' },
        orderBy: { AssignedDate: 'desc' },
        select: { Amount: true, driverId: true },
      });

      if (!rideRequest || !rideRequest.Amount || !rideRequest.driverId) {
        throw new NotFoundException(
          `Could not find an accepted ride request for child ${childId} to create new payments.`,
        );
      }

      const childData = await this.prisma.child.findUnique({
        where: { child_id: childId },
        select: { customerId: true },
      });

      if (!childData || childData.customerId === null) {
        throw new NotFoundException(
          `Could not find customer data for child ${childId}.`,
        );
      }

      const validCustomerId = childData.customerId;

      // 4b. Prepare the new records for creation
      const newRecordsData = monthsToCreate.map((m) => {
        return {
          childId: childId,
          driverId: rideRequest.driverId,
          customerId: validCustomerId,
          paymentMonth: m.month,
          paymentYear: m.year,
          baseMonthlyPrice: rideRequest.Amount ?? 0,
          finalPrice: rideRequest.Amount ?? 0,
          paymentStatus: ChildPaymentStatus.AWAITING_CONFIRMATION,
          paymentMethod: 'PHYSICAL',
          updatedAt: new Date(),
          dueDate: new Date(m.year, m.month - 1, 5),
          gracePeriodEndDate: new Date(m.year, m.month - 1, 10),
        };
      });

      // 4c. Create the new records
      const createResult = await this.prisma.childPayment.createMany({
        data: newRecordsData,
        skipDuplicates: true,
      });
      createdCount = createResult.count;
    }

    // 5. Handle the "To Update" list
    if (recordsToUpdate.length > 0) {
      // Get the IDs ONLY from the 'recordsToUpdate' list
      const recordIdsToUpdate = recordsToUpdate.map((rec) => rec.id);

      // Update ONLY those specific records
      const updateResult = await this.prisma.childPayment.updateMany({
        where: {
          id: { in: recordIdsToUpdate },
        },
        data: {
          paymentStatus: 'AWAITING_CONFIRMATION',
          paymentMethod: 'PHYSICAL',
          updatedAt: new Date(),
        },
      });
      updatedCount = updateResult.count;
    }

    // 6. Return a combined success message
    return {
      message: `Submission successful. ${updatedCount} records updated, ${createdCount} new records created. All are awaiting driver confirmation.`,
    };
  }

  async getPendingConfirmations(driverId: number) {
    return this.prisma.childPayment.findMany({
      where: {
        driverId: driverId,
        paymentStatus: 'AWAITING_CONFIRMATION',
      },
      include: {
        // Include child and customer names for the driver's card
        Child: {
          select: {
            child_id: true,
            childFirstName: true,
            childLastName: true,
          },
        },
        Customer: {
          select: {
            customer_id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: [{ paymentYear: 'asc' }, { paymentMonth: 'asc' }],
    });
  }

  /**
   * Accept a pending payment confirmation and mark it as PAID.
   * Driver confirms that customer has paid physically.
   */
  async acceptPaymentConfirmation(paymentId: number, driverId: number) {
    // 1. Find the payment record
    const payment = await this.prisma.childPayment.findUnique({
      where: { id: paymentId },
      select: {
        id: true,
        driverId: true,
        paymentStatus: true,
        finalPrice: true,
        childId: true,
        paymentMonth: true,
        paymentYear: true,
      },
    });

    // 2. Validate the payment exists
    if (!payment) {
      throw new NotFoundException(
        `Payment record with ID ${paymentId} not found.`,
      );
    }

    // 3. Validate the driver owns this payment
    if (payment.driverId !== driverId) {
      throw new BadRequestException(
        'You are not authorized to accept this payment.',
      );
    }

    // 4. Validate the payment status
    if (payment.paymentStatus !== 'AWAITING_CONFIRMATION') {
      throw new BadRequestException(
        `Cannot accept payment. Current status is ${payment.paymentStatus}. Only payments with status AWAITING_CONFIRMATION can be accepted.`,
      );
    }

    // 5. Update the payment status to PAID
    const updatedPayment = await this.prisma.childPayment.update({
      where: { id: paymentId },
      data: {
        paymentStatus: ChildPaymentStatus.PAID,
        amountPaid: payment.finalPrice, // Set amount paid to final price
        paymentMethod: 'PHYSICAL', // Keep as physical payment
        updatedAt: new Date(),
      },
      include: {
        Child: {
          select: {
            child_id: true,
            childFirstName: true,
            childLastName: true,
          },
        },
        Customer: {
          select: {
            customer_id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: 'Payment confirmed successfully.',
      payment: updatedPayment,
    };
  }

  /**
   * Create next month's payment records for all users based on last month's records.
   * This function should be called once a month (e.g., on the 1st of each month).
   * It copies all active payment records from the previous month and creates new ones
   * for the current month with calculated status based on payment history.
   */
  async createMonthlyPaymentRecords() {
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();

    // Calculate previous month
    let previousMonth = currentMonth - 1;
    let previousYear = currentYear;

    if (previousMonth === 0) {
      previousMonth = 12;
      previousYear--;
    }

    // 1. Get all payment records from previous month
    const lastMonthRecords = await this.prisma.childPayment.findMany({
      where: {
        paymentYear: previousYear,
        paymentMonth: previousMonth,
        // Only copy records that have an active ride assignment
        // Exclude cancelled ones
        paymentStatus: {
          notIn: [ChildPaymentStatus.CANCELLED],
        },
      },
      select: {
        childId: true,
        driverId: true,
        customerId: true,
        baseMonthlyPrice: true,
        finalPrice: true,
      },
    });

    if (lastMonthRecords.length === 0) {
      return {
        message: 'No records found from previous month to copy.',
        created: 0,
        month: currentMonth,
        year: currentYear,
      };
    }

    // 2. Check which records already exist for current month (avoid duplicates)
    const existingCurrentMonthRecords = await this.prisma.childPayment.findMany(
      {
        where: {
          paymentYear: currentYear,
          paymentMonth: currentMonth,
        },
        select: {
          childId: true,
        },
      },
    );

    const existingChildIds = new Set(
      existingCurrentMonthRecords.map((r) => r.childId),
    );

    // 3. Filter out records that already exist for current month
    const recordsToCreate = lastMonthRecords.filter(
      (record) => !existingChildIds.has(record.childId),
    );

    if (recordsToCreate.length === 0) {
      return {
        message: 'All current month records already exist.',
        created: 0,
        skipped: lastMonthRecords.length,
        month: currentMonth,
        year: currentYear,
      };
    }

    // 4. For each child, find their last PAID record to calculate payment status
    const childIds = recordsToCreate.map((r) => r.childId);

    // Get last paid records for all children at once
    const lastPaidRecords = await this.prisma.childPayment.findMany({
      where: {
        childId: { in: childIds },
        paymentStatus: 'PAID',
      },
      orderBy: [{ paymentYear: 'desc' }, { paymentMonth: 'desc' }],
      select: {
        childId: true,
        paymentMonth: true,
        paymentYear: true,
      },
    });

    // Create a map of childId -> last paid record
    const lastPaidMap = new Map<
      number,
      { paymentMonth: number; paymentYear: number }
    >();

    // Group by childId and keep only the most recent paid record for each
    lastPaidRecords.forEach((record) => {
      if (!lastPaidMap.has(record.childId)) {
        lastPaidMap.set(record.childId, {
          paymentMonth: record.paymentMonth,
          paymentYear: record.paymentYear,
        });
      }
    });

    // 5. Calculate payment status for each record based on last paid month
    const newRecordsData = recordsToCreate.map((record) => {
      let paymentStatus: ChildPaymentStatus;

      const lastPaid = lastPaidMap.get(record.childId);

      if (lastPaid) {
        // Calculate months since last payment
        const monthsSinceLastPaid =
          (currentYear - lastPaid.paymentYear) * 12 +
          (currentMonth - lastPaid.paymentMonth);

        // Determine status based on gap:
        // 0-1 months: OVERDUE
        // 2-3 months: GRACE_PERIOD
        // >3 months: CANCELLED
        if (monthsSinceLastPaid <= 1) {
          paymentStatus = ChildPaymentStatus.OVERDUE;
        } else if (monthsSinceLastPaid <= 3) {
          paymentStatus = ChildPaymentStatus.GRACE_PERIOD;
        } else {
          paymentStatus = ChildPaymentStatus.CANCELLED;
        }
      } else {
        // No paid records found - this is a new user or first payment
        // Set as OVERDUE (payment is due)
        paymentStatus = ChildPaymentStatus.OVERDUE;
      }

      return {
        childId: record.childId,
        driverId: record.driverId,
        customerId: record.customerId,
        paymentMonth: currentMonth,
        paymentYear: currentYear,
        baseMonthlyPrice: record.baseMonthlyPrice,
        finalPrice: record.finalPrice,
        paymentStatus: paymentStatus,
        updatedAt: new Date(),
        createdAt: new Date(previousYear, previousMonth - 1, 1), // Set to first day of previous month
        dueDate: new Date(currentYear, currentMonth - 1, 5), // 5th of current month
        gracePeriodEndDate: new Date(currentYear, currentMonth - 1, 10), // 10th of current month
      };
    });

    // 6. Create all records in bulk
    const result = await this.prisma.childPayment.createMany({
      data: newRecordsData,
      skipDuplicates: true, // Safety check
    });

    // 7. Calculate statistics for response
    const statusCounts = {
      OVERDUE: newRecordsData.filter(
        (r) => r.paymentStatus === ChildPaymentStatus.OVERDUE,
      ).length,
      GRACE_PERIOD: newRecordsData.filter(
        (r) => r.paymentStatus === ChildPaymentStatus.GRACE_PERIOD,
      ).length,
      CANCELLED: newRecordsData.filter(
        (r) => r.paymentStatus === ChildPaymentStatus.CANCELLED,
      ).length,
    };

    return {
      message: `Successfully created ${result.count} payment records for ${currentMonth}/${currentYear}`,
      created: result.count,
      skipped: lastMonthRecords.length - recordsToCreate.length,
      month: currentMonth,
      year: currentYear,
      previousMonth: previousMonth,
      previousYear: previousYear,
      statusBreakdown: statusCounts,
    };
  }

  /**
   * Get payment history for a child
   * Returns all payment records ordered by most recent first
   */
  async getPaymentHistory(childId: number) {
    const payments = await this.prisma.childPayment.findMany({
      where: {
        childId: childId,
      },
      include: {
        Driver: {
          select: {
            driver_id: true,
            name: true,
          },
        },
      },
      orderBy: [{ paymentYear: 'desc' }, { paymentMonth: 'desc' }],
    });

    // Format the response
    return payments.map((payment: any) => {
      const driverName = payment.Driver?.name || null;

      return {
        id: payment.id,
        month: payment.paymentMonth,
        year: payment.paymentYear,
        amount: payment.amountPaid ?? payment.finalPrice,
        baseAmount: payment.baseMonthlyPrice,
        status: payment.paymentStatus,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.updatedAt,
        dueDate: payment.dueDate,
        driverName: driverName,
      };
    });
  }
}
