import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';

export class MarkAttendanceDto {
  driverId: number;
  childId: number;
  waypointId?: number;
  type: 'pickup' | 'dropoff';
  latitude?: number;
  longitude?: number;
  notes?: string;
  tripId?: number;
}

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('mark')
  async markAttendance(@Body() dto: MarkAttendanceDto) {
    const attendance = await this.attendanceService.markAttendance(dto);
    return {
      success: true,
      data: attendance,
      message: 'Attendance marked successfully',
    };
  }

  @Get('history/:driverId')
  async getAttendanceHistory(
    @Param('driverId') driverId: number,
    @Query('date') date?: string,
  ) {
    const parsedDate = date ? new Date(date) : undefined;
    const attendance = await this.attendanceService.getAttendanceHistory(
      driverId,
      parsedDate,
    );
    return {
      success: true,
      data: attendance,
    };
  }
}
