import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { ChildPaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async createPayment(dto: CreatePaymentDto) {
    // Check if payment already exists for this month/year
    const existing = await this.prisma.childPayment.findUnique({
      where: {
        childId_paymentYear_paymentMonth: {
          childId: dto.childId,
          paymentYear: dto.paymentYear,
          paymentMonth: dto.paymentMonth,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Payment already exists for this period');
    }

    const paymentEvents = [
      {
        event: 'CREATED',
        timestamp: new Date().toISOString(),
        amount: dto.finalPrice,
      },
    ];

    return this.prisma.childPayment.create({
      data: {
        ...dto,
        paymentEvents,
        paymentStatus: dto.isPrepaid
          ? ChildPaymentStatus.PAID
          : ChildPaymentStatus.PENDING,
        amountPaid: dto.isPrepaid ? dto.finalPrice : 0,
        updatedAt: new Date(),
      },
      include: {
        Child: true,
        Customer: true,
        Driver: true,
      },
    });
  }

  async findAll(filterDto: PaymentFilterDto) {
    const { page = 1, limit = 20, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.driverId) where.driverId = filters.driverId;
    if (filters.customerId) where.customerId = filters.customerId;
    if (filters.childId) where.childId = filters.childId;
    if (filters.status) where.paymentStatus = filters.status;
    if (filters.paymentMonth) where.paymentMonth = filters.paymentMonth;
    if (filters.paymentYear) where.paymentYear = filters.paymentYear;

    const [payments, total] = await Promise.all([
      this.prisma.childPayment.findMany({
        where,
        skip,
        take: limit,
        include: {
          Child: true,
          Customer: true,
          Driver: true,
        },
        orderBy: [{ paymentYear: 'desc' }, { paymentMonth: 'desc' }],
      }),
      this.prisma.childPayment.count({ where }),
    ]);

    return {
      data: payments,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const payment = await this.prisma.childPayment.findUnique({
      where: { id },
      include: {
        Child: true,
        Customer: true,
        Driver: true,
      },
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async verifyPayment(id: number, verifiedBy: number) {
    const payment = await this.findOne(id);

    const paymentEvents = [
      ...(payment.paymentEvents as any[]),
      {
        event: 'VERIFIED',
        timestamp: new Date().toISOString(),
        verifiedBy,
      },
    ];

    return this.prisma.childPayment.update({
      where: { id },
      data: {
        paymentStatus: ChildPaymentStatus.PAID,
        amountPaid: payment.finalPrice,
        paymentEvents,
        updatedAt: new Date(),
      },
      include: {
        Child: true,
        Customer: true,
        Driver: true,
      },
    });
  }

  async markAsPaid(id: number, amount: number, transactionRef?: string) {
    const payment = await this.findOne(id);

    const paymentEvents = [
      ...(payment.paymentEvents as any[]),
      {
        event: 'PAID',
        timestamp: new Date().toISOString(),
        amount,
        transactionRef,
      },
    ];

    return this.prisma.childPayment.update({
      where: { id },
      data: {
        paymentStatus: ChildPaymentStatus.PAID,
        amountPaid: amount,
        transactionRef,
        paymentEvents,
        updatedAt: new Date(),
      },
    });
  }

  async getPaymentStatistics() {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    const [
      totalPayments,
      pendingCount,
      paidCount,
      overdueCount,
      monthlyRevenue,
      todayRevenue,
    ] = await Promise.all([
      this.prisma.childPayment.count(),
      this.prisma.childPayment.count({
        where: { paymentStatus: ChildPaymentStatus.PENDING },
      }),
      this.prisma.childPayment.count({
        where: { paymentStatus: ChildPaymentStatus.PAID },
      }),
      this.prisma.childPayment.count({
        where: { paymentStatus: ChildPaymentStatus.OVERDUE },
      }),
      this.prisma.childPayment.aggregate({
        where: {
          paymentYear: currentYear,
          paymentMonth: currentMonth,
          paymentStatus: ChildPaymentStatus.PAID,
        },
        _sum: { amountPaid: true },
      }),
      this.prisma.childPayment.aggregate({
        where: {
          updatedAt: {
            gte: new Date(currentDate.setHours(0, 0, 0, 0)),
          },
          paymentStatus: ChildPaymentStatus.PAID,
        },
        _sum: { amountPaid: true },
      }),
    ]);

    return {
      overview: {
        total: totalPayments,
        pending: pendingCount,
        paid: paidCount,
        overdue: overdueCount,
      },
      revenue: {
        today: todayRevenue._sum.amountPaid || 0,
        thisMonth: monthlyRevenue._sum.amountPaid || 0,
      },
    };
  }
}
