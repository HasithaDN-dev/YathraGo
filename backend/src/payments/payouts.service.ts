import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ApprovePayoutDto } from './dto/approve-payout.dto';
import { ChildPaymentStatus } from '@prisma/client';

@Injectable()
export class PayoutsService {
  constructor(private prisma: PrismaService) {}

  async calculateDriverPayout(driverId: number, month: number, year: number) {
    const payments = await this.prisma.childPayment.findMany({
      where: {
        driverId,
        paymentMonth: month,
        paymentYear: year,
        paymentStatus: ChildPaymentStatus.PAID,
      },
      include: {
        Child: true,
      },
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalTrips = payments.length;
    
    // Calculate commission (85% to driver, 15% platform fee)
    const platformFee = totalRevenue * 0.15;
    const driverEarnings = totalRevenue - platformFee;

    return {
      driverId,
      month,
      year,
      totalTrips,
      totalRevenue,
      platformFee,
      driverEarnings,
      payments,
    };
  }

  async getPendingPayouts() {
    const currentDate = new Date();
    const lastMonth = currentDate.getMonth();
    const year = lastMonth === 0 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
    const month = lastMonth === 0 ? 12 : lastMonth;

    // Get all drivers with paid payments from last month
    const drivers = await this.prisma.driver.findMany({
      where: {
        ChildPayment: {
          some: {
            paymentMonth: month,
            paymentYear: year,
            paymentStatus: ChildPaymentStatus.PAID,
          },
        },
      },
      include: {
        ChildPayment: {
          where: {
            paymentMonth: month,
            paymentYear: year,
            paymentStatus: ChildPaymentStatus.PAID,
          },
        },
      },
    });

    const payouts = await Promise.all(
      drivers.map((driver) =>
        this.calculateDriverPayout(driver.driver_id, month, year),
      ),
    );

    return payouts;
  }

  async approvePayout(dto: ApprovePayoutDto) {
    // This would integrate with payment gateway in production
    // For now, we just return the payout details
    
    const payoutDetails = await this.calculateDriverPayout(
      dto.driverId,
      dto.paymentMonth,
      dto.paymentYear,
    );

    return {
      ...payoutDetails,
      status: 'APPROVED',
      approvedAt: new Date(),
      payoutAmount: dto.payoutAmount,
      bankAccount: dto.bankAccount,
      paymentMethod: dto.paymentMethod,
      notes: dto.notes,
    };
  }

  async getPayoutHistory(driverId: number, limit: number = 12) {
    const currentDate = new Date();
    const payouts: any[] = [];

    for (let i = 0; i < limit; i++) {
      const date = new Date(currentDate);
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const payout = await this.calculateDriverPayout(driverId, month, year);
      if (payout.totalTrips > 0) {
        payouts.push(payout);
      }
    }

    return payouts;
  }
}
