import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto, ChangePasswordDto } from './dto';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Module resolution issue with barrel exports
import { AdminJwtGuard } from '../../admin-auth/guards';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Module resolution issue with barrel exports
import { GetAdmin } from '../../admin-auth/decorators';

// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
@UseGuards(AdminJwtGuard)
@Controller('admin/profile')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  getProfile(@GetAdmin('id') adminId: number) {
    return this.profileService.getProfile(adminId);
  }

  @Patch()
  updateProfile(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    @GetAdmin('id') adminId: number,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profileService.updateProfile(adminId, dto);
  }

  @Patch('password')
  changePassword(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    @GetAdmin('id') adminId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.profileService.changePassword(adminId, dto);
  }

  @Get('activity')
  getActivity(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    @GetAdmin('id') adminId: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return this.profileService.getActivity(adminId, limit);
  }
}
