import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintInquiryDto, UpdateComplaintInquiryDto } from './dto';
import {
  UserTypes,
  ComplaintStatus,
  ComplaintInquiryTypes,
  ComplaintInquiryCategory,
} from '@prisma/client';

@Injectable()
export class ComplaintsInquiriesService {
  private readonly logger = new Logger(ComplaintsInquiriesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new complaint or inquiry
   */
  async create(dto: CreateComplaintInquiryDto) {
    try {
      const complaintInquiry = await this.prisma.complaintsInquiries.create({
        data: {
          senderId: dto.senderId,
          senderUserType: dto.senderUserType,
          type: dto.type,
          description: dto.description,
          category: dto.category,
          status: ComplaintStatus.PENDING,
        },
      });

      this.logger.log(
        `Created ${dto.type.toLowerCase()} with ID: ${complaintInquiry.id} by ${dto.senderUserType} (ID: ${dto.senderId})`,
      );

      return {
        success: true,
        data: complaintInquiry,
        message: `${dto.type === ComplaintInquiryTypes.COMPLAINT ? 'Complaint' : 'Inquiry'} submitted successfully`,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to create complaint/inquiry: ${message}`);
      throw new BadRequestException(
        `Failed to create complaint/inquiry: ${message}`,
      );
    }
  }

  /**
   * Get all complaints/inquiries for a specific sender
   */
  async findBySender(senderId: number, senderUserType: UserTypes) {
    try {
      const statusOrder: Record<string, number> = {
        PENDING: 0,
        IN_PROGRESS: 1,
        RESOLVED: 2,
      };
      const records = await this.prisma.complaintsInquiries.findMany({
        where: {
          senderId,
          senderUserType,
        },
      });
      // Sort by status (pending first), then by createdAt desc
      const sorted = records.sort((a, b) => {
        if (statusOrder[a.status] !== statusOrder[b.status]) {
          return statusOrder[a.status] - statusOrder[b.status];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      return {
        success: true,
        count: sorted.length,
        data: sorted,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to retrieve records for sender ${senderId}: ${message}`,
      );
      throw new BadRequestException(`Failed to retrieve records: ${message}`);
    }
  }

  /**
   * Get a single complaint/inquiry by ID
   */
  async findOne(id: number) {
    try {
      const record = await this.prisma.complaintsInquiries.findUnique({
        where: { id },
      });

      if (!record) {
        throw new NotFoundException(
          `Complaint/Inquiry with ID ${id} not found`,
        );
      }

      return {
        success: true,
        data: record,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to retrieve record ${id}: ${message}`);
      throw new BadRequestException(`Failed to retrieve record: ${message}`);
    }
  }

  /**
   * Get all complaints/inquiries (for admin/management use)
   */
  async findAll(
    status?: ComplaintStatus,
    type?: ComplaintInquiryTypes,
    category?: ComplaintInquiryCategory,
  ) {
    try {
      const where: {
        status?: ComplaintStatus;
        type?: ComplaintInquiryTypes;
        category?: ComplaintInquiryCategory;
      } = {};

      if (status) {
        where.status = status;
      }

      if (type) {
        where.type = type;
      }

      if (category) {
        where.category = category;
      }

      const records = await this.prisma.complaintsInquiries.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        count: records.length,
        data: records,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to retrieve all records: ${message}`);
      throw new BadRequestException(`Failed to retrieve records: ${message}`);
    }
  }

  /**
   * Update complaint/inquiry status
   */
  async updateStatus(id: number, dto: UpdateComplaintInquiryDto) {
    try {
      // Check if record exists
      const existing = await this.prisma.complaintsInquiries.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Complaint/Inquiry with ID ${id} not found`,
        );
      }

      const updated = await this.prisma.complaintsInquiries.update({
        where: { id },
        data: {
          status: dto.status,
        },
      });

      this.logger.log(
        `Updated complaint/inquiry ${id} status to ${dto.status}`,
      );

      return {
        success: true,
        data: updated,
        message: 'Status updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to update record ${id}: ${message}`);
      throw new BadRequestException(`Failed to update record: ${message}`);
    }
  }

  /**
   * Delete a complaint/inquiry
   */
  async delete(id: number) {
    try {
      const existing = await this.prisma.complaintsInquiries.findUnique({
        where: { id },
      });

      if (!existing) {
        throw new NotFoundException(
          `Complaint/Inquiry with ID ${id} not found`,
        );
      }

      await this.prisma.complaintsInquiries.delete({
        where: { id },
      });

      this.logger.log(`Deleted complaint/inquiry with ID: ${id}`);

      return {
        success: true,
        message: 'Record deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to delete record ${id}: ${message}`);
      throw new BadRequestException(`Failed to delete record: ${message}`);
    }
  }

  /**
   * Get statistics for complaints/inquiries
   */
  async getStatistics() {
    try {
      const [total, pending, inProgress, resolved, complaints, inquiries] =
        await Promise.all([
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
          this.prisma.complaintsInquiries.count({
            where: { type: ComplaintInquiryTypes.COMPLAINT },
          }),
          this.prisma.complaintsInquiries.count({
            where: { type: ComplaintInquiryTypes.INQUIRY },
          }),
        ]);

      return {
        success: true,
        data: {
          total,
          byStatus: {
            pending,
            inProgress,
            resolved,
          },
          byType: {
            complaints,
            inquiries,
          },
        },
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to retrieve statistics: ${message}`);
      throw new BadRequestException(
        `Failed to retrieve statistics: ${message}`,
      );
    }
  }
}
