import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
import { ComplaintFilterDto } from './dto/complaint-filter.dto';
import { ComplaintStatus } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(createComplaintDto: CreateComplaintDto) {
    return this.prisma.complaintsInquiries.create({
      data: {
        senderId: createComplaintDto.senderId,
        senderUserType: createComplaintDto.senderUserType,
        type: createComplaintDto.type,
        description: createComplaintDto.description,
        category: createComplaintDto.category,
      },
    });
  }

  async findAll(filterDto: ComplaintFilterDto) {
    const { page = 1, limit = 20, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    if (filters.category) where.category = filters.category;
    if (filters.senderUserType) where.senderUserType = filters.senderUserType;
    if (filters.senderId) where.senderId = filters.senderId;

    const [complaints, total] = await Promise.all([
      this.prisma.complaintsInquiries.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.complaintsInquiries.count({ where }),
    ]);

    return {
      data: complaints,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const complaint = await this.prisma.complaintsInquiries.findUnique({
      where: { id },
    });

    if (!complaint) {
      throw new NotFoundException(`Complaint with ID ${id} not found`);
    }

    return complaint;
  }

  async update(id: number, updateComplaintDto: UpdateComplaintDto) {
    await this.findOne(id);

    return this.prisma.complaintsInquiries.update({
      where: { id },
      data: updateComplaintDto,
    });
  }

  async updateStatus(id: number, status: ComplaintStatus) {
    await this.findOne(id);

    return this.prisma.complaintsInquiries.update({
      where: { id },
      data: { status },
    });
  }

  async getStatistics() {
    const [
      totalComplaints,
      pendingCount,
      inProgressCount,
      resolvedCount,
      byCategory,
      byType,
      recentComplaints,
    ] = await Promise.all([
      this.prisma.complaintsInquiries.count(),
      this.prisma.complaintsInquiries.count({
        where: { status: ComplaintStatus.PENDING },
      }),
      this.prisma.complaintsInquiries.count({
        where: { status: ComplaintStatus.IN_PROGRESS },
      }),
      this.prisma.complaintsInquiries.count({
        where: { status: ComplaintStatus.RESOLVED },
      }),
      this.prisma.complaintsInquiries.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
      this.prisma.complaintsInquiries.groupBy({
        by: ['type'],
        _count: { id: true },
      }),
      this.prisma.complaintsInquiries.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      overview: {
        total: totalComplaints,
        pending: pendingCount,
        inProgress: inProgressCount,
        resolved: resolvedCount,
      },
      byCategory: byCategory.map((item) => ({
        category: item.category,
        count: item._count.id,
      })),
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count.id,
      })),
      recent: recentComplaints,
    };
  }

  async delete(id: number) {
    await this.findOne(id);
    return this.prisma.complaintsInquiries.delete({
      where: { id },
    });
  }
}
