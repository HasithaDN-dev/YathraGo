import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ComplaintStatus } from '@prisma/client';

@Injectable()
export class ManagerService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get comprehensive statistics for manager dashboard
   */
  async getStatistics() {
    // Get complaints statistics
    const [
      totalComplaints,
      openComplaints,
      inProgressComplaints,
      resolvedComplaints,
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
    ]);

    // Get active drivers count
    const activeDrivers = await this.prisma.driver.count({
      where: {
        status: 'ACTIVE',
      },
    });

    // Get total vehicles count
    const totalVehicles = await this.prisma.vehicle.count();

    // Get published notices count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentNotices = await this.prisma.notification.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    // Get recent complaints (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentComplaintsCount = await this.prisma.complaintsInquiries.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    // Get complaints by category for insights
    const complaintsByCategory = await this.prisma.complaintsInquiries.groupBy({
      by: ['category'],
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    return {
      overview: {
        openComplaints,
        inProgressComplaints,
        resolvedComplaints,
        totalComplaints,
        activeDrivers,
        totalVehicles,
        recentNotices,
        recentComplaintsCount,
      },
      complaints: {
        total: totalComplaints,
        pending: openComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        recentCount: recentComplaintsCount,
      },
      fleet: {
        activeDrivers,
        totalVehicles,
      },
      notifications: {
        recentCount: recentNotices,
      },
      insights: {
        topComplaintCategories: complaintsByCategory.map((item) => ({
          category: item.category,
          count: item._count.id,
        })),
      },
    };
  }

  /**
   * Generate comprehensive reports based on report type and date range
   */
  async generateReport(reportType: string, dateFrom?: Date, dateTo?: Date) {
    const startDate = dateFrom || new Date(new Date().setMonth(new Date().getMonth() - 6));
    const endDate = dateTo || new Date();

    switch (reportType) {
      case 'system-revenue':
        return await this.generateRevenueReport(startDate, endDate);
      case 'fleet-oversight':
        return await this.generateFleetReport(startDate, endDate);
      case 'driver-management':
        return await this.generateDriverReport(startDate, endDate);
      case 'complaint-resolution':
        return await this.generateComplaintReport(startDate, endDate);
      case 'customer-overview':
        return await this.generateCustomerReport(startDate, endDate);
      case 'attendance-tracking':
        return await this.generateAttendanceReport(startDate, endDate);
      default:
        throw new Error(`Unknown report type: ${reportType}`);
    }
  }

  /**
   * Revenue & Payment Analysis Report
   */
  private async generateRevenueReport(startDate: Date, endDate: Date) {
    const [
      totalPayments,
      paidPayments,
      pendingPayments,
      overduePayments,
      monthlyRevenue,
      paymentsByMonth,
    ] = await Promise.all([
      this.prisma.childPayment.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.childPayment.count({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.childPayment.count({
        where: {
          paymentStatus: 'PENDING',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.childPayment.count({
        where: {
          paymentStatus: 'OVERDUE',
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.childPayment.aggregate({
        where: {
          paymentStatus: 'PAID',
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { finalPrice: true },
      }),
      this.prisma.childPayment.groupBy({
        by: ['paymentYear', 'paymentMonth'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _sum: { finalPrice: true, amountPaid: true },
        _count: { id: true },
        orderBy: [{ paymentYear: 'asc' }, { paymentMonth: 'asc' }],
      }),
    ]);

    const totalRevenue = monthlyRevenue._sum.finalPrice || 0;
    const outstandingAmount = await this.prisma.childPayment.aggregate({
      where: {
        paymentStatus: { in: ['PENDING', 'OVERDUE'] },
        createdAt: { gte: startDate, lte: endDate },
      },
      _sum: { finalPrice: true, amountPaid: true },
    });

    const outstanding = (outstandingAmount._sum.finalPrice || 0) - (outstandingAmount._sum.amountPaid || 0);

    return {
      reportType: 'system-revenue',
      dateRange: { from: startDate, to: endDate },
      summary: {
        totalPayments,
        paidPayments,
        pendingPayments,
        overduePayments,
        totalRevenue,
        outstandingAmount: outstanding,
      },
      monthlyTrends: paymentsByMonth.map((month) => ({
        year: month.paymentYear,
        month: month.paymentMonth,
        revenue: month._sum.finalPrice || 0,
        amountPaid: month._sum.amountPaid || 0,
        paymentCount: month._count.id,
      })),
    };
  }

  /**
   * Fleet Operations Overview Report
   */
  private async generateFleetReport(startDate: Date, endDate: Date) {
    const [
      totalVehicles,
      totalDrivers,
      activeRoutes,
      vehicleAlerts,
      routesByDriver,
    ] = await Promise.all([
      this.prisma.vehicle.count(),
      this.prisma.driver.count({ where: { status: 'ACTIVE' } }),
      this.prisma.driverRoute.count({
        where: {
          date: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
      }),
      this.prisma.vehicleAlert.count({
        where: {
          reportedAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.driverRoute.groupBy({
        by: ['driverId'],
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' },
        },
        take: 10,
      }),
    ]);

    const alertsByType = await this.prisma.vehicleAlert.groupBy({
      by: ['alertType', 'status'],
      where: {
        reportedAt: { gte: startDate, lte: endDate },
      },
      _count: { id: true },
    });

    return {
      reportType: 'fleet-oversight',
      dateRange: { from: startDate, to: endDate },
      summary: {
        totalVehicles,
        activeDrivers: totalDrivers,
        completedRoutes: activeRoutes,
        totalAlerts: vehicleAlerts,
      },
      topDriversByRoutes: routesByDriver.map((driver) => ({
        driverId: driver.driverId,
        routeCount: driver._count.id,
      })),
      alertAnalysis: alertsByType.map((alert) => ({
        type: alert.alertType,
        status: alert.status,
        count: alert._count.id,
      })),
    };
  }

  /**
   * Driver Management Report
   */
  private async generateDriverReport(startDate: Date, endDate: Date) {
    const [
      totalDrivers,
      activeDrivers,
      driversByStatus,
      recentDrivers,
      driverAttendance,
    ] = await Promise.all([
      this.prisma.driver.count(),
      this.prisma.driver.count({ where: { status: 'ACTIVE' } }),
      this.prisma.driver.groupBy({
        by: ['registrationStatus'],
        _count: { driver_id: true },
      }),
      this.prisma.driver.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.attendance.groupBy({
        by: ['driverId'],
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' },
        },
        take: 10,
      }),
    ]);

    return {
      reportType: 'driver-management',
      dateRange: { from: startDate, to: endDate },
      summary: {
        totalDrivers,
        activeDrivers,
        newDrivers: recentDrivers,
      },
      registrationBreakdown: driversByStatus.map((status) => ({
        status: status.registrationStatus,
        count: status._count?.driver_id || 0,
      })),
      topDriversByAttendance: driverAttendance.map((driver) => ({
        driverId: driver.driverId,
        attendanceCount: driver._count.id,
      })),
    };
  }

  /**
   * Complaints & Inquiries Report
   */
  private async generateComplaintReport(startDate: Date, endDate: Date) {
    const [
      totalComplaints,
      complaintsByStatus,
      complaintsByCategory,
      recentComplaints,
    ] = await Promise.all([
      this.prisma.complaintsInquiries.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.complaintsInquiries.groupBy({
        by: ['status'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
      }),
      this.prisma.complaintsInquiries.groupBy({
        by: ['category', 'type'],
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
        orderBy: {
          _count: { id: 'desc' },
        },
      }),
      this.prisma.complaintsInquiries.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      reportType: 'complaint-resolution',
      dateRange: { from: startDate, to: endDate },
      summary: {
        totalComplaints,
        recentComplaints,
      },
      statusBreakdown: complaintsByStatus.map((status) => ({
        status: status.status,
        count: status._count.id,
      })),
      categoryAnalysis: complaintsByCategory.map((item) => ({
        category: item.category,
        type: item.type,
        count: item._count.id,
      })),
    };
  }

  /**
   * Customer & Children Report
   */
  private async generateCustomerReport(startDate: Date, endDate: Date) {
    const [
      totalCustomers,
      activeCustomers,
      totalChildren,
      newCustomers,
      customersByGender,
      childrenBySchool,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.customer.count({ where: { status: 'ACTIVE' } }),
      this.prisma.child.count(),
      this.prisma.customer.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.customer.groupBy({
        by: ['gender'],
        _count: { customer_id: true },
      }),
      this.prisma.child.groupBy({
        by: ['school'],
        _count: { child_id: true },
        orderBy: {
          _count: { child_id: 'desc' },
        },
        take: 10,
      }),
    ]);

    return {
      reportType: 'customer-overview',
      dateRange: { from: startDate, to: endDate },
      summary: {
        totalCustomers,
        activeCustomers,
        totalChildren,
        newCustomers,
      },
      demographics: {
        byGender: customersByGender.map((g) => ({
          gender: g.gender,
          count: g._count?.customer_id || 0,
        })),
      },
      topSchools: childrenBySchool.map((school) => ({
        school: school.school,
        studentCount: school._count?.child_id || 0,
      })),
    };
  }

  /**
   * Attendance & Routes Report
   */
  private async generateAttendanceReport(startDate: Date, endDate: Date) {
    const [
      totalAttendance,
      attendanceByType,
      completedRoutes,
      routesByStatus,
      dailyAttendance,
    ] = await Promise.all([
      this.prisma.attendance.count({
        where: {
          date: { gte: startDate, lte: endDate },
        },
      }),
      this.prisma.attendance.groupBy({
        by: ['type'],
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
      }),
      this.prisma.driverRoute.count({
        where: {
          date: { gte: startDate, lte: endDate },
          status: 'COMPLETED',
        },
      }),
      this.prisma.driverRoute.groupBy({
        by: ['status'],
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
      }),
      this.prisma.attendance.groupBy({
        by: ['date'],
        where: {
          date: { gte: startDate, lte: endDate },
        },
        _count: { id: true },
        orderBy: { date: 'desc' },
        take: 30,
      }),
    ]);

    return {
      reportType: 'attendance-tracking',
      dateRange: { from: startDate, to: endDate },
      summary: {
        totalAttendance,
        completedRoutes,
      },
      attendanceBreakdown: attendanceByType.map((type) => ({
        type: type.type,
        count: type._count.id,
      })),
      routeStatusBreakdown: routesByStatus.map((status) => ({
        status: status.status,
        count: status._count.id,
      })),
      dailyTrends: dailyAttendance.map((day) => ({
        date: day.date,
        attendanceCount: day._count.id,
      })),
    };
  }
}
