import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

// User data interface for consistent typing
export interface UserData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  address: string;
  status: string;
  joinDate: string;
  userType: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all roles with their user counts
   * Combines data from multiple user tables based on UserTypes and Role enums
   */
  async getRolesWithCounts() {
    // Count users by UserTypes (from different tables)
    const [
      customersCount,
      driversCount,
      staffCount,
      vehicleOwnersCount,
      childrenCount,
    ] = await Promise.all([
      this.prisma.customer.count(),
      this.prisma.driver.count(),
      this.prisma.staff_Passenger.count(),
      this.prisma.vehicleOwner.count(),
      this.prisma.child.count(),
    ]);

    // Count webusers by Role enum
    const webusersByRole = await this.prisma.webuser.groupBy({
      by: ['role'],
      _count: {
        role: true,
      },
    });

    // Count admins and managers
    const [adminsCount, managersCount] = await Promise.all([
      this.prisma.admin.count({ where: { isActive: true } }),
      this.prisma.manager.count({ where: { isActive: true } }),
    ]);

    // Map webuser roles
    const roleMap: Record<string, number> = {};
    webusersByRole.forEach((item) => {
      roleMap[item.role] = item._count.role;
    });

    // Build response with all role types
    const roles = [
      {
        name: 'Children',
        userCount: childrenCount,
        color: '#3b82f6',
        userType: 'CHILD',
      },
      {
        name: 'Staff Passengers',
        userCount: staffCount,
        color: '#10b981',
        userType: 'STAFF',
      },
      {
        name: 'Drivers',
        userCount: driversCount,
        color: '#f59e0b',
        userType: 'DRIVER',
      },
      {
        name: 'Owners',
        userCount: roleMap['OWNER'] || 0,
        color: '#8b5cf6',
        userType: 'OWNER',
      },
      {
        name: 'System Admins',
        userCount: (roleMap['ADMIN'] || 0) + adminsCount,
        color: '#ef4444',
        userType: 'ADMIN',
      },
      {
        name: 'System Managers',
        userCount: (roleMap['MANAGER'] || 0) + managersCount,
        color: '#06b6d4',
        userType: 'MANAGER',
      },
      {
        name: 'Driver Coordinators',
        userCount: roleMap['DRIVER_COORDINATOR'] || 0,
        color: '#ec4899',
        userType: 'DRIVER_COORDINATOR',
      },
      {
        name: 'Finance Managers',
        userCount: roleMap['FINANCE_MANAGER'] || 0,
        color: '#14b8a6',
        userType: 'FINANCE_MANAGER',
      },
      {
        name: 'Customers',
        userCount: customersCount,
        color: '#8b5cf6',
        userType: 'CUSTOMER',
      },
      {
        name: 'Vehicle Owners',
        userCount: vehicleOwnersCount,
        color: '#f97316',
        userType: 'VEHICLEOWNER',
      },
    ];

    return {
      roles,
      totalUsers: roles.reduce((sum, role) => sum + role.userCount, 0),
    };
  }

  /**
   * Get users by role/user type
   */
  async getUsersByRole(roleType: string): Promise<UserData[]> {
    let users: UserData[] = [];

    switch (roleType) {
      case 'CHILD': {
        const children = await this.prisma.child.findMany({
          select: {
            child_id: true,
            childFirstName: true,
            childLastName: true,
            customerId: true,
          },
        });
        users = children.map((c) => ({
          id: `CHD${String(c.child_id).padStart(3, '0')}`,
          name: `${c.childFirstName} ${c.childLastName}`,
          email: '',
          mobile: '',
          address: '',
          status: 'Active',
          joinDate: '',
          userType: 'CHILD',
          parentId: c.customerId,
        }));
        break;
      }

      case 'STAFF': {
        const staff = await this.prisma.staff_Passenger.findMany({
          include: {
            Customer: true,
          },
        });
        users = staff.map((s) => ({
          id: `STP${String(s.id).padStart(3, '0')}`,
          name: `${s.Customer.firstName} ${s.Customer.lastName}`,
          email: s.Customer.email || '',
          mobile: s.Customer.phone,
          address: s.workAddress || '',
          status: s.Customer.status === 'ACTIVE' ? 'Active' : 'Inactive',
          joinDate: s.Customer.createdAt.toISOString().split('T')[0],
          userType: 'STAFF',
          workLocation: s.workLocation,
        }));
        break;
      }

      case 'DRIVER': {
        const drivers = await this.prisma.driver.findMany({
          select: {
            driver_id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            createdAt: true,
            status: true,
            NIC: true,
          },
        });
        users = drivers.map((d) => ({
          id: `DRV${String(d.driver_id).padStart(3, '0')}`,
          name: d.name,
          email: d.email || '',
          mobile: d.phone,
          address: d.address || '',
          status: d.status === 'ACTIVE' ? 'Active' : 'Inactive',
          joinDate: d.createdAt.toISOString().split('T')[0],
          userType: 'DRIVER',
          nic: d.NIC,
        }));
        break;
      }

      case 'CUSTOMER': {
        const customers = await this.prisma.customer.findMany({
          select: {
            customer_id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            address: true,
            createdAt: true,
            status: true,
          },
        });
        users = customers.map((c) => ({
          id: `CUS${String(c.customer_id).padStart(3, '0')}`,
          name: `${c.firstName} ${c.lastName}`,
          email: c.email || '',
          mobile: c.phone,
          address: c.address || '',
          status: c.status === 'ACTIVE' ? 'Active' : 'Inactive',
          joinDate: c.createdAt.toISOString().split('T')[0],
          userType: 'CUSTOMER',
        }));
        break;
      }

      case 'OWNER':
      case 'DRIVER_COORDINATOR':
      case 'FINANCE_MANAGER': {
        const webusers = await this.prisma.webuser.findMany({
          where: { role: roleType as Role },
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            address: true,
            createdAt: true,
            role: true,
          },
        });
        users = webusers.map((w) => ({
          id: `WEB${String(w.id).padStart(3, '0')}`,
          name: w.username,
          email: w.email,
          mobile: w.phone || '',
          address: w.address || '',
          status: 'Active',
          joinDate: w.createdAt.toISOString().split('T')[0],
          userType: w.role,
        }));
        break;
      }

      case 'ADMIN': {
        // Get admins from both Admin table and Webuser table
        const [admins, webuserAdmins] = await Promise.all([
          this.prisma.admin.findMany({
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              createdAt: true,
              isActive: true,
              permissions: true,
            },
          }),
          this.prisma.webuser.findMany({
            where: { role: 'ADMIN' },
            select: {
              id: true,
              username: true,
              email: true,
              phone: true,
              address: true,
              createdAt: true,
              role: true,
            },
          }),
        ]);

        const adminUsers = admins.map((a) => ({
          id: `ADM${String(a.id).padStart(3, '0')}`,
          name: `${a.firstName} ${a.lastName}`,
          email: a.email,
          mobile: '',
          address: '',
          status: a.isActive ? 'Active' : 'Inactive',
          joinDate: a.createdAt.toISOString().split('T')[0],
          userType: 'ADMIN',
          permissions: a.permissions,
          source: 'Admin Table',
        }));

        const webuserAdminUsers = webuserAdmins.map((w) => ({
          id: `WADM${String(w.id).padStart(3, '0')}`,
          name: w.username,
          email: w.email,
          mobile: w.phone || '',
          address: w.address || '',
          status: 'Active',
          joinDate: w.createdAt.toISOString().split('T')[0],
          userType: 'ADMIN',
          source: 'Webuser Table',
        }));

        users = [...adminUsers, ...webuserAdminUsers];
        break;
      }

      case 'MANAGER': {
        // Get managers from both Manager table and Webuser table
        const [managers, webuserManagers] = await Promise.all([
          this.prisma.manager.findMany({
            where: { isActive: true },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              department: true,
              level: true,
              createdAt: true,
              isActive: true,
            },
          }),
          this.prisma.webuser.findMany({
            where: { role: 'MANAGER' },
            select: {
              id: true,
              username: true,
              email: true,
              phone: true,
              address: true,
              createdAt: true,
              role: true,
            },
          }),
        ]);

        const managerUsers = managers.map((m) => ({
          id: `MGR${String(m.id).padStart(3, '0')}`,
          name: `${m.firstName} ${m.lastName}`,
          email: m.email,
          mobile: '',
          address: '',
          status: m.isActive ? 'Active' : 'Inactive',
          joinDate: m.createdAt.toISOString().split('T')[0],
          userType: 'MANAGER',
          department: m.department,
          level: m.level,
          source: 'Manager Table',
        }));

        const webuserManagerUsers = webuserManagers.map((w) => ({
          id: `WMGR${String(w.id).padStart(3, '0')}`,
          name: w.username,
          email: w.email,
          mobile: w.phone || '',
          address: w.address || '',
          status: 'Active',
          joinDate: w.createdAt.toISOString().split('T')[0],
          userType: 'MANAGER',
          source: 'Webuser Table',
        }));

        users = [...managerUsers, ...webuserManagerUsers];
        break;
      }

      case 'VEHICLEOWNER': {
        const vehicleOwners = await this.prisma.vehicleOwner.findMany({
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone: true,
            Address: true,
            company: true,
          },
        });
        users = vehicleOwners.map((v) => ({
          id: `VOW${String(v.id).padStart(3, '0')}`,
          name: `${v.first_name || ''} ${v.last_name || ''}`.trim() || 'N/A',
          email: v.email || '',
          mobile: v.phone || '',
          address: v.Address || '',
          status: 'Active',
          joinDate: '',
          userType: 'VEHICLEOWNER',
          company: v.company,
        }));
        break;
      }

      default:
        return [];
    }

    return users;
  }

  /**
   * Search users across all roles or specific role by name, email, user ID, or mobile
   */
  async searchUsers(query: string, roleType?: string) {
    const searchTerm = query.toLowerCase().trim();
    const results: UserData[] = [];

    // Define which role types to search
    const roleTypesToSearch = roleType
      ? [roleType]
      : [
          'CHILD',
          'STAFF',
          'DRIVER',
          'CUSTOMER',
          'OWNER',
          'DRIVER_COORDINATOR',
          'FINANCE_MANAGER',
          'ADMIN',
          'MANAGER',
          'VEHICLEOWNER',
        ];

    // Search each role type
    for (const type of roleTypesToSearch) {
      const users = await this.getUsersByRole(type);

      // Filter users by search term
      const matchedUsers = users.filter((user: UserData) => {
        const userName = String(user.name || '').toLowerCase();
        const userEmail = String(user.email || '').toLowerCase();
        const userMobile = String(user.mobile || '').toLowerCase();
        const userId = String(user.id || '').toLowerCase();

        return (
          userName.includes(searchTerm) ||
          userEmail.includes(searchTerm) ||
          userMobile.includes(searchTerm) ||
          userId.includes(searchTerm)
        );
      });

      results.push(...matchedUsers);
    }

    return {
      results,
      totalResults: results.length,
      searchQuery: query,
      roleType: roleType || 'all',
    };
  }
}
