import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefundDto } from './dto/create-refund.dto';

@Injectable()
export class RefundsService {
  constructor(private prisma: PrismaService) {}

  async requestRefund(dto: CreateRefundDto) {
    // Verify payment exists
    const payment = await this.prisma.childPayment.findUnique({
      where: { id: dto.paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (dto.refundAmount > payment.amountPaid) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    return this.prisma.paymentRefund.create({
      data: dto,
    });
  }

  async findAll(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status: status as any } : {};

    const [refunds, total] = await Promise.all([
      this.prisma.paymentRefund.findMany({
        where,
        skip,
        take: limit,
        orderBy: { requestedAt: 'desc' },
      }),
      this.prisma.paymentRefund.count({ where }),
    ]);

    return {
      data: refunds,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const refund = await this.prisma.paymentRefund.findUnique({
      where: { id },
    });

    if (!refund) {
      throw new NotFoundException('Refund not found');
    }

    return refund;
  }

  async approveRefund(
    id: number,
    approverId: number,
    approverType: any,
    refundMethod?: string,
    transactionRef?: string,
  ) {
    const refund = await this.findOne(id);

    // Update payment to reflect refund
    await this.prisma.childPayment.update({
      where: { id: refund.paymentId },
      data: {
        amountPaid: {
          decrement: refund.refundAmount,
        },
      },
    });

    return this.prisma.paymentRefund.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: approverId,
        approvedByType: approverType,
        processedAt: new Date(),
        refundMethod,
        transactionRef,
        updatedAt: new Date(),
      },
    });
  }

  async rejectRefund(
    id: number,
    rejectorId: number,
    rejectionReason: string,
  ) {
    await this.findOne(id);

    return this.prisma.paymentRefund.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectedBy: rejectorId,
        rejectionReason,
        processedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  async getStatistics() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.paymentRefund.count(),
      this.prisma.paymentRefund.count({ where: { status: 'PENDING' } }),
      this.prisma.paymentRefund.count({ where: { status: 'APPROVED' } }),
      this.prisma.paymentRefund.count({ where: { status: 'REJECTED' } }),
    ]);

    const totalRefundAmount = await this.prisma.paymentRefund.aggregate({
      where: { status: 'APPROVED' },
      _sum: { refundAmount: true },
    });

    return {
      overview: {
        total,
        pending,
        approved,
        rejected,
      },
      totalRefundAmount: totalRefundAmount._sum.refundAmount || 0,
    };
  }
}
