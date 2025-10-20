import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto, AdminRegisterDto } from './dto';
import { AdminJwtGuard } from './guards/admin-jwt.guard';
import { GetAdmin } from './decorators/get-admin.decorator';
import { Request } from 'express';

@Controller('admin-auth')
export class AdminAuthController {
  constructor(private adminAuthService: AdminAuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.adminAuthService.login(dto, ipAddress, userAgent);
  }

  @Post('register')
  @UseGuards(AdminJwtGuard) // Only authenticated admins can create new admins
  async register(@Body() dto: AdminRegisterDto) {
    return this.adminAuthService.register(dto);
  }

  @Post('logout')
  @UseGuards(AdminJwtGuard)
  async logout(@GetAdmin('id') adminId: number, @Req() req: Request) {
    const token = req.headers.authorization?.split(' ')[1] || '';
    return this.adminAuthService.logout(adminId, token);
  }

  @Get('me')
  @UseGuards(AdminJwtGuard)
  async getMe(@GetAdmin('id') adminId: number) {
    return this.adminAuthService.getMe(adminId);
  }

  @Get('sessions')
  @UseGuards(AdminJwtGuard)
  async getSessions(@GetAdmin('id') adminId: number) {
    return this.adminAuthService.getSessions(adminId);
  }

  @Delete('sessions/:id')
  @UseGuards(AdminJwtGuard)
  async revokeSession(
    @GetAdmin('id') adminId: number,
    @Param('id', ParseIntPipe) sessionId: number,
  ) {
    return this.adminAuthService.revokeSession(adminId, sessionId);
  }
}
