import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Get parents list
  @Get('users/parents')
  @HttpCode(HttpStatus.OK)
  async getParents() {
    return this.adminService.getParents();
  }

  // Get staff passengers list
  @Get('users/staff-passengers')
  @HttpCode(HttpStatus.OK)
  async getStaffPassengers() {
    return this.adminService.getStaffPassengers();
  }

  // Get drivers list
  @Get('users/drivers')
  @HttpCode(HttpStatus.OK)
  async getDrivers() {
    return this.adminService.getDrivers();
  }

  // Get owners list
  @Get('users/owners')
  @HttpCode(HttpStatus.OK)
  async getOwners() {
    return this.adminService.getOwners();
  }

  // Get admins list
  @Get('users/admins')
  @HttpCode(HttpStatus.OK)
  async getAdmins() {
    return this.adminService.getAdmins();
  }

  // Get managers list
  @Get('users/managers')
  @HttpCode(HttpStatus.OK)
  async getManagers() {
    return this.adminService.getManagers();
  }

  // Get backup drivers list
  @Get('users/backup-drivers')
  @HttpCode(HttpStatus.OK)
  async getBackupDrivers() {
    return this.adminService.getBackupDrivers();
  }

  // Get children list
  @Get('users/children')
  @HttpCode(HttpStatus.OK)
  async getChildren() {
    return this.adminService.getChildren();
  }

  // Get web users list
  @Get('users/web-users')
  @HttpCode(HttpStatus.OK)
  async getWebUsers() {
    return this.adminService.getWebUsers();
  }

  // Update user status
  @Patch('users/:userType/:userId/status')
  @HttpCode(HttpStatus.OK)
  async updateUserStatus(
    @Param('userType') userType: string,
    @Param('userId') userId: string,
    @Body() body: { status: string },
  ) {
    return this.adminService.updateUserStatus(userType, userId, body.status);
  }
}
