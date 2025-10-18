import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsDto } from './dto/payment-filter.dto';

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
        child: true,
        customer: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    // Map to DTO format (optional, if you want to clean up or rename fields)
    return payments.map((p) => ({
      childId: p.childId,
      childName: p.child?.childFirstName, // optional
      paymentDate: p.updatedAt, // or dueDate / firstUsageDate
      paymentMethod: p.paymentMethod ?? undefined,
      transactionRef: p.transactionRef ?? undefined,
      paymentAmount:
        p.paymentStatus === 'PAID' ? p.amountPaid : p.carryForwardDue,
      paymentStatus: p.paymentStatus,
    }));
  }
}
