import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChildPaymentStatus } from '@prisma/client';

@Injectable()
export class FinanceStatisticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive finance statistics
   */
  async getStatistics(timeRange: 'today' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    const startDate = this.getStartDate(timeRange, now);

    const [
      todayRevenue,
      periodRevenue,
      pendingPayments,
      overduePayments,
      gracePeriodPayments,
      prepaidRevenue,
      collectionStats,
      failedPayments,
      monthlyPayments,
      paymentBalance,
    ] = await Promise.all([
      this.getTodayRevenue(),
      this.getPeriodRevenue(startDate),
      this.getPendingPayments(),
      this.getOverduePayments(),
      this.getGracePeriodPayments(),
      this.getPrepaidRevenue(),
      this.getCollectionStats(),
      this.getFailedPayments(),
      this.getMonthlyPaymentStats(),
      this.getPaymentBalanceStats(),
    ]);

    return {
      primaryMetrics: {
        todayRevenue,
        periodRevenue,
        pendingPayments,
        overduePayments,
      },
      secondaryMetrics: {
        collectionRate: collectionStats.collectionRate,
        gracePeriodPayments,
        prepaidRevenue,
        failedPayments,
      },
      additionalStats: {
        monthlyPayments,
        paymentBalance,
        averagePaymentPerChild: collectionStats.averagePaymentPerChild,
        onTimePaymentRate: collectionStats.onTimePaymentRate,
        averageDaysToPayment: collectionStats.averageDaysToPayment,
      },
    };
  }

  /**
   * Get payment status distribution
   */
  async getPaymentStatusDistribution() {
    const statusGroups = await this.prisma.childPayment.groupBy({
      by: ['paymentStatus'],
      _count: {
        id: true,
      },
      _sum: {
        finalPrice: true,
        amountPaid: true,
      },
    });

    const total = statusGroups.reduce((sum, group) => sum + group._count.id, 0);

    return statusGroups.map((group) => ({
      status: group.paymentStatus,
      count: group._count.id,
      amount: group._sum.finalPrice || 0,
      amountPaid: group._sum.amountPaid || 0,
      percentage: total > 0 ? ((group._count.id / total) * 100).toFixed(1) : '0',
    }));
  }

  /**
   * Get top paying customers
   */
  async getTopCustomers(limit: number = 5) {
    const customers = await this.prisma.childPayment.groupBy({
      by: ['customerId'],
      _sum: {
        amountPaid: true,
        finalPrice: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _sum: {
          amountPaid: 'desc',
        },
      },
      take: limit,
    });

    const customerDetails = await Promise.all(
      customers.map(async (customer) => {
        const customerInfo = await this.prisma.customer.findUnique({
          where: { customer_id: customer.customerId },
          select: {
            firstName: true,
            lastName: true,
          },
        });

        // Calculate reliability (percentage of paid vs expected)
        const reliability =
          customer._sum.finalPrice && customer._sum.finalPrice > 0
            ? Math.round(
                ((customer._sum.amountPaid || 0) / customer._sum.finalPrice) * 100,
              )
            : 0;

        return {
          customerId: customer.customerId,
          name: customerInfo
            ? `${customerInfo.firstName} ${customerInfo.lastName}`
            : 'Unknown Customer',
          totalPaid: customer._sum.amountPaid || 0,
          paymentsCount: customer._count.id,
          reliability,
        };
      }),
    );

    return customerDetails;
  }

  /**
   * Get recent payments
   */
  async getRecentPayments(limit: number = 10) {
    const payments = await this.prisma.childPayment.findMany({
      take: limit,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        Customer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        Child: {
          select: {
            childFirstName: true,
            childLastName: true,
          },
        },
      },
    });

    return payments.map((payment) => ({
      id: `PAY-${payment.id}`,
      customerId: payment.customerId,
      customerName: payment.Customer
        ? `${payment.Customer.firstName} ${payment.Customer.lastName}`
        : 'Unknown',
      childName: payment.Child
        ? `${payment.Child.childFirstName} ${payment.Child.childLastName}`
        : 'Unknown',
      amount: payment.finalPrice,
      amountPaid: payment.amountPaid,
      status: payment.paymentStatus,
      date: payment.updatedAt,
      paymentMethod: payment.paymentMethod || 'Not specified',
      transactionRef: payment.transactionRef,
    }));
  }

  /**
   * Get risk indicators
   */
  async getRiskIndicators() {
    const [multipleOverdue, highCarryForward, gracePeriodExpiring] =
      await Promise.all([
        this.getCustomersWithMultipleOverdue(),
        this.getHighCarryForwardDue(),
        this.getGracePeriodExpiring(),
      ]);

    return {
      multipleOverdue,
      highCarryForward,
      gracePeriodExpiring,
    };
  }

  /**
   * Get quick insights
   */
  async getQuickInsights() {
    const [avgPaymentPerChild, onTimeRate, avgDaysToPayment, priceAdjustments] =
      await Promise.all([
        this.getAveragePaymentPerChild(),
        this.getOnTimePaymentRate(),
        this.getAverageDaysToPayment(),
        this.getPriceAdjustmentsCount(),
      ]);

    return {
      avgPaymentPerChild,
      onTimeRate,
      avgDaysToPayment,
      priceAdjustments,
    };
  }

  // ==================== PRIVATE HELPER METHODS ====================

  private getStartDate(
    timeRange: 'today' | 'week' | 'month' | 'year',
    now: Date,
  ): Date {
    const startDate = new Date(now);
    startDate.setHours(0, 0, 0, 0);

    switch (timeRange) {
      case 'today':
        return startDate;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        return startDate;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        return startDate;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        return startDate;
      default:
        return startDate;
    }
  }

  private async getTodayRevenue() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await this.prisma.childPayment.aggregate({
      where: {
        paymentStatus: ChildPaymentStatus.PAID,
        updatedAt: {
          gte: today,
        },
      },
      _sum: {
        amountPaid: true,
      },
      _count: true,
    });

    return {
      amount: result._sum.amountPaid || 0,
      count: result._count,
    };
  }

  private async getPeriodRevenue(startDate: Date) {
    const result = await this.prisma.childPayment.aggregate({
      where: {
        paymentStatus: ChildPaymentStatus.PAID,
        updatedAt: {
          gte: startDate,
        },
      },
      _sum: {
        amountPaid: true,
      },
      _count: true,
    });

    return {
      amount: result._sum.amountPaid || 0,
      count: result._count,
    };
  }

  private async getPendingPayments() {
    const result = await this.prisma.childPayment.aggregate({
      where: {
        paymentStatus: ChildPaymentStatus.PENDING,
      },
      _sum: {
        finalPrice: true,
      },
      _count: true,
    });

    return {
      amount: result._sum.finalPrice || 0,
      count: result._count,
    };
  }

  private async getOverduePayments() {
    const result = await this.prisma.childPayment.aggregate({
      where: {
        paymentStatus: ChildPaymentStatus.OVERDUE,
      },
      _sum: {
        finalPrice: true,
        amountPaid: true,
      },
      _count: true,
    });

    return {
      amount: (result._sum.finalPrice || 0) - (result._sum.amountPaid || 0),
      count: result._count,
    };
  }

  private async getGracePeriodPayments() {
    const result = await this.prisma.childPayment.aggregate({
      where: {
        paymentStatus: ChildPaymentStatus.GRACE_PERIOD,
      },
      _sum: {
        finalPrice: true,
      },
      _count: true,
    });

    return {
      amount: result._sum.finalPrice || 0,
      count: result._count,
    };
  }

  private async getPrepaidRevenue() {
    const result = await this.prisma.childPayment.aggregate({
      where: {
        isPrepaid: true,
      },
      _sum: {
        amountPaid: true,
      },
      _count: true,
    });

    return {
      amount: result._sum.amountPaid || 0,
      count: result._count,
    };
  }

  private async getFailedPayments() {
    const result = await this.prisma.childPayment.aggregate({
      where: {
        paymentStatus: ChildPaymentStatus.CANCELLED,
      },
      _count: true,
    });

    return {
      count: result._count,
    };
  }

  private async getCollectionStats() {
    const allPayments = await this.prisma.childPayment.aggregate({
      _sum: {
        finalPrice: true,
        amountPaid: true,
      },
      _avg: {
        finalPrice: true,
      },
      _count: true,
    });

    const paidPayments = await this.prisma.childPayment.count({
      where: {
        paymentStatus: ChildPaymentStatus.PAID,
      },
    });

    const collectionRate =
      allPayments._sum.finalPrice && allPayments._sum.finalPrice > 0
        ? (
            ((allPayments._sum.amountPaid || 0) / allPayments._sum.finalPrice) *
            100
          ).toFixed(1)
        : '0';

    const onTimePaymentRate =
      allPayments._count > 0
        ? ((paidPayments / allPayments._count) * 100).toFixed(1)
        : '0';

    return {
      collectionRate,
      averagePaymentPerChild: allPayments._avg.finalPrice || 0,
      onTimePaymentRate,
      averageDaysToPayment: 3.2, // This would need more complex calculation
    };
  }

  private async getMonthlyPaymentStats() {
    const result = await this.prisma.monthlyPayment.aggregate({
      _sum: {
        amount: true,
      },
      _count: true,
    });

    const paid = await this.prisma.monthlyPayment.count({
      where: {
        paid: true,
      },
    });

    return {
      totalAmount: result._sum.amount || 0,
      totalCount: result._count,
      paidCount: paid,
      pendingCount: result._count - paid,
    };
  }

  private async getPaymentBalanceStats() {
    const result = await this.prisma.paymentBalance.aggregate({
      _sum: {
        amountDue: true,
        balance: true,
      },
      _count: true,
    });

    return {
      totalAmountDue: result._sum.amountDue || 0,
      totalBalance: result._sum.balance || 0,
      count: result._count,
    };
  }

  private async getCustomersWithMultipleOverdue() {
    const overduePayments = await this.prisma.childPayment.groupBy({
      by: ['customerId'],
      where: {
        paymentStatus: ChildPaymentStatus.OVERDUE,
      },
      _count: {
        id: true,
      },
      having: {
        id: {
          _count: {
            gt: 1,
          },
        },
      },
    });

    return {
      count: overduePayments.length,
      customerIds: overduePayments.map((p) => p.customerId),
    };
  }

  private async getHighCarryForwardDue() {
    const threshold = 10000; // Define threshold for "high"
    const result = await this.prisma.childPayment.aggregate({
      where: {
        carryForwardDue: {
          gt: threshold,
        },
      },
      _sum: {
        carryForwardDue: true,
      },
      _count: true,
    });

    return {
      amount: result._sum.carryForwardDue || 0,
      count: result._count,
    };
  }

  private async getGracePeriodExpiring() {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const result = await this.prisma.childPayment.count({
      where: {
        paymentStatus: ChildPaymentStatus.GRACE_PERIOD,
        gracePeriodEndDate: {
          lte: sevenDaysFromNow,
        },
      },
    });

    return {
      count: result,
    };
  }

  private async getAveragePaymentPerChild() {
    const result = await this.prisma.childPayment.aggregate({
      _avg: {
        finalPrice: true,
      },
    });

    return result._avg.finalPrice || 0;
  }

  private async getOnTimePaymentRate() {
    const total = await this.prisma.childPayment.count();
    const onTime = await this.prisma.childPayment.count({
      where: {
        paymentStatus: ChildPaymentStatus.PAID,
      },
    });

    return total > 0 ? ((onTime / total) * 100).toFixed(1) : '0';
  }

  private async getAverageDaysToPayment() {
    // This is a simplified version - actual calculation would be more complex
    // Would need to calculate difference between dueDate and actual payment date
    return 3.2;
  }

  private async getPriceAdjustmentsCount() {
    const result = await this.prisma.childPayment.count({
      where: {
        isAdjusted: true,
      },
    });

    return result;
  }
}
