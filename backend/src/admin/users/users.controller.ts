import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';
// import { AdminJwtGuard } from '../../admin-auth/guards/admin-jwt.guard';

@Controller('admin/users')
// @UseGuards(AdminJwtGuard) // Temporarily disabled for testing
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /admin/users/roles
   * Get all roles with their user counts
   */
  @Get('roles')
  async getRolesWithCounts() {
    return this.usersService.getRolesWithCounts();
  }

  /**
   * GET /admin/users/by-role?roleType=PARENT
   * Get users by role/user type
   */
  @Get('by-role')
  async getUsersByRole(@Query('roleType') roleType: string) {
    if (!roleType) {
      return { error: 'roleType query parameter is required' };
    }
    return this.usersService.getUsersByRole(roleType);
  }

  /**
   * GET /admin/users/search?query=john&roleType=PARENT
   * Search users across all roles or specific role
   */
  @Get('search')
  async searchUsers(
    @Query('query') query: string,
    @Query('roleType') roleType?: string,
  ) {
    if (!query || query.trim().length === 0) {
      return { results: [], message: 'Search query is required' };
    }
    return await this.usersService.searchUsers(query, roleType);
  }
}
