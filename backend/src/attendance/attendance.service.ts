import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private prisma: PrismaService) {}

  async markAttendance(data: {
    driverId: number;
    childId: number;
    waypointId?: number;
    type: 'pickup' | 'dropoff';
    latitude?: number;
    longitude?: number;
    notes?: string;
    tripId?: number;
  }) {
    try {
      const attendance = await this.prisma.attendance.create({
        data: {
          driverId: data.driverId,
          childId: data.childId,
          waypointId: data.waypointId,
          type: data.type,
          latitude: data.latitude,
          longitude: data.longitude,
          notes: data.notes,
          tripId: data.tripId,
          status: 'completed',
        },
        include: {
          child: {
            select: {
              child_id: true,
              childFirstName: true,
              childLastName: true,
            },
          },
          driver: {
            select: {
              driver_id: true,
              name: true,
            },
          },
        },
      });

      this.logger.log(
        `Attendance marked for child ${data.childId} by driver ${data.driverId}`,
      );
      return attendance;
    } catch (error) {
      this.logger.error('Failed to mark attendance:', error);
      throw error;
    }
  }

  async getAttendanceHistory(driverId: number, date?: Date) {
    try {
      const whereClause: any = { driverId };

      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        whereClause.timestamp = {
          gte: startOfDay,
          lte: endOfDay,
        };
      }

      const attendance = await this.prisma.attendance.findMany({
        where: whereClause,
        include: {
          child: {
            select: {
              child_id: true,
              childFirstName: true,
              childLastName: true,
            },
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
      });

      return attendance;
    } catch (error) {
      this.logger.error('Failed to get attendance history:', error);
      throw error;
    }
  }
}
